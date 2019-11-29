import {BitBurner as NS} from "Bitburner";

import {
    availableWorkers,
    DCRun
} from "hhelper.js";

export async function main(ns: NS) {
    let ram = availableWorkers(ns).freeRAM;
    let target = ns.args[0];
    let threads = Math.floor(ram / 1.75);
    let processes: any = [];
    processes.push({script: "loopweaken.js", RAM: 1.75, threads: threads, modules: 1, args: {target: target}, allowSplit : true});
    ns.tprint(`Trying to run with ${threads} threads`);
    let result = await DCRun(ns, processes, true);
    ns.tprint(`${result.result}`);
}