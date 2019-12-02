import {BitBurner as NS} from "Bitburner";
import {
    getServers,
    sortByHackingLvl,
    getFacServers,
    DCRun
} from "hhelper.js";

function forcePorts(ns: NS, s, pr) {
    ns.purchaseTor();
    if (pr >= 1) {
        //@ts-ignore
        if (!ns.fileExists(`BruteSSH.exe`) && !ns.purchaseProgram('BruteSSH.exe')) {
            return false;
        } else
            ns.brutessh(s);
    }
    if (pr >= 2) {
        //@ts-ignore
        if (!ns.fileExists(`FTPCrack.exe`) && !ns.purchaseProgram('FTPCrack.exe')) {
            return false;
        } else
            ns.ftpcrack(s);
    }
    if (pr >= 3) {
        //@ts-ignore
        if (!ns.fileExists(`relaySMTP.exe`) && !ns.purchaseProgram('relaySMTP.exe')) {
            return false;
        } else
            ns.relaysmtp(s);
    }
    if (pr >= 4) {
        //@ts-ignore
        if (!ns.fileExists(`HTTPWorm.exe`) && !ns.purchaseProgram('HTTPWorm.exe')) {
            return false;
        } else
            ns.httpworm(s);
    }
    if (pr == 5) {
        //@ts-ignore
        if (!ns.fileExists(`SQLInject.exe`) && !ns.purchaseProgram('SQLInject.exe')) {
            return false;
        } else
            ns.sqlinject(s);
    }
    return true;
}

export async function main(ns) {
    ns.disableLog("ALL");
    let servers = sortByHackingLvl(getServers(ns));
    for (let i = 0; i < servers.length; i++) {
        let server = servers[i];
        let s = server.name;

        if (s == "home" || s == "darkweb" || s.startsWith("pserv")) continue;
        if (ns.hasRootAccess(s)) continue;

        let hl = ns.getHackingLevel();
        let hr = server.reqHacking;
        let sleepInterval = 30000;

        while (hr > ns.getHackingLevel())
            await ns.sleep(sleepInterval);

        if (server.reqPorts >= 1) {
            while (!forcePorts(ns, s, server.reqPorts))
                await ns.sleep(sleepInterval);
        }

        ns.nuke(s);
        ns.tprint("Nuked " + s);

        if (getFacServers()[s])
            continue;

        let wt = Math.ceil((server.secLvl - server.minSecLvl) / 0.05);
        if (wt <= 0) {
            ns.tprint(s + " is already at min security");
            continue;
        }
        let processes = [{ "script": "1weaken.js", "modules": 1, "threads": wt, "args": s, "RAM": 1.75, "allowSplit": true }];
        let WT = ns.getWeakenTime(s);
        let dcResult = await DCRun(ns, processes, true);
        if(dcResult.success)
            ns.tprint("Weakening " + s + " with " + wt + " threads in " + Math.ceil(WT) + "s");
        else
            ns.tprint(`${dcResult.result}`);

        //await ns.run("SM6.js", 1, s, 1000);
    }

    ns.tprint('Network infected!');
}