import {BitBurner as NS} from "Bitburner";

import {
    DCRun,
    getServers
} from "hhelper.js";

export async function main(ns) {
    let servers = getServers(ns).filter(function(server) {
        return (server.hasRoot && (server.secLvl > server.minSecLvl));
    });

    let processes: any = [];
    servers.forEach(function(s) {
        let reqReduction = s.secLvl - s.minSecLvl;
        let threads = Math.ceil(reqReduction / 0.05);
        //ns.tprint(`Need to weaken ${s.name} with ${threads} threads`);
        processes.push({ "script": "1weaken.js", "threads": threads, "modules": 1, "args": s.name, "RAM": 1.75, "allowSplit": true });
    });

    //ns.tprint(`Launchind DCRun...`);
    let dcResult = await DCRun(ns, processes, true);
    ns.tprint(`Weakening: ${dcResult.success}, message: ${dcResult.result}`);
}