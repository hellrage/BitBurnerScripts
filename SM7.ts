import { BitBurner as NS } from "Bitburner";
import {
    getFacServers,
    DCRun,
    availableWorkers
} from "hhelper.js";

import {
    Process
} from "Process.js";

export async function main(ns: NS) {
    ns.disableLog("ALL");
    let DEBUG = ns.args.includes("debug");
    let noHacks = ns.args.includes("nohacks");
    let target = ns.args[0];
    let deltaArgIndex = ns.args.findIndex(function (arg) { return arg == "-delta"; });

    if (ns.getServerMaxMoney(target) == 0) {
        ns.tprint("Tried to target " + target);
        return;
    }

    let GSI = 0.004;
    let HSI = 0.002;
    let WSI = 0.05;

    while (true) {
        let delta = (deltaArgIndex != -1) ? ns.args[deltaArgIndex + 1] / 1000 : 0.3;
        if (ns.getServerMoneyAvailable(target) == ns.getServerMaxMoney(target))
            noHacks = false;
        let HackPercent = ns.hackAnalyzePercent(target);
        let Grows = Math.max(1, Math.ceil(ns.growthAnalyze(target, 100 / (100 - 3 * HackPercent))));
        let Hacks = noHacks ? 0 : 1;

        let SI = Math.max(GSI * Grows, Hacks * HSI);
        let Weakens = Math.ceil(SI / WSI);
        let ttH = ns.getHackTime(target);
        let ttG = ns.getGrowTime(target);
        let ttW = ns.getWeakenTime(target);

        let availRAM = availableWorkers(ns).freeRAM;
        let reqRAM = noHacks ? (1.75 * (Grows + Weakens)) : (1.7 * Hacks + 1.75 * (Grows + 2 * Weakens));
        if (DEBUG) ns.tprint(`${availRAM}GB RAM available, ${reqRAM}GB required per module`);

        let blocks = 1;
        let threads = 1;
        let modules = Math.floor(availRAM / reqRAM);

        if (Math.floor((ttH / delta) / 4) > 30)
            delta = Math.floor((1000 * ttH) / (30 * 4)) / 1000;

        let timeBlocks = Math.floor((ttH / delta) / 4);

        if (modules < 1 || timeBlocks < 1) {
            ns.tprint(`Can't sustain any modules!`);
            return;
        } else if (modules > timeBlocks) {
            blocks = timeBlocks;
            threads = noHacks ? Math.floor(modules / blocks) : Math.floor(Math.min(95 / HackPercent, Math.floor(modules / blocks)));
        } else
            blocks = modules;

        let processes: Process[] = [];
        for (let i = 0; i < blocks; i++) {
            let Hargs = {
                "target": target,
                "startDelay": (ttW - ttH + delta) + i * (4 * delta),
                "affectStocks": false,
                "debug": DEBUG
            };
            if (!noHacks)
                processes.push(new Process("hack3.js", false, Hacks, threads, Hargs, 1.7));

            let Gargs = {
                "target": target,
                "startDelay": (ttW - ttG - delta) + i * (4 * delta),
                "affectStocks": true,
                "debug": DEBUG
            };
            processes.push(new Process("grow3.js", true, Grows, threads, Gargs, 1.75));

            let Wargs = {
                "target": target,
                "startDelay": i * (4 * delta),
                "affectStocks": false,
                "debug": DEBUG
            };
            processes.push(new Process("weaken3.js", true, Weakens, threads, Wargs, 1.75));

            let Wargs2 = {
                "target": target,
                "startDelay": i * (4 * delta) + 2 * delta,
                "affectStocks": false,
                "debug": DEBUG
            };
            if (!noHacks)
                processes.push(new Process("weaken3.js", true, Weakens, threads, Wargs2, 1.75));
        }

        let dcResult = await DCRun(ns, processes);
        while (!dcResult.success && threads >= 2) {
            threads = Math.floor(threads * 0.95);
            if (DEBUG) ns.tprint(`Retrying with ${threads} threads...`);
            processes.forEach(function (proc) {
                proc.threads = Math.floor(proc.threads * 0.95);
                proc.args.threads = Math.floor(proc.args.threads * 0.95);
            });
            dcResult = await DCRun(ns, processes);
        }
        if (!dcResult.success) {
            ns.tprint(`Can't DCRun! ${dcResult.result}`);
            return;
        }
        let startDate = new Date();
        let endDate = new Date();
        startDate.setTime(startDate.getTime() + (ttW + delta) * 1000);
        endDate.setTime(endDate.getTime() + (ttW + 4 * delta * blocks) * 1000);
        ns.tprint([
            "Targeting",
            target,
            "H:", Hacks,
            "G:", Grows,
            "W:", Weakens,
            "Blocks:", blocks,
            "Threads:", threads,
            "Delta:", delta,
            "Scripts start: ",
            startDate.toLocaleTimeString(),
            "and end: ", endDate.toLocaleTimeString()
        ].join(" "));

        await ns.sleep((ttW + 4 * delta * blocks) * 1000);
    }

}