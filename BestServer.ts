import {BitBurner as NS} from "Bitburner";

import {
    getServers,
    compareProfit
} from "hhelper.js";

export function main(ns: NS) {
    hackableServers(ns).forEach(function(s) {
        ns.tprint(`${s.name} ${s.profit} ${s.hackTime * 4} `);
    });
}

export function hackableServers(ns) {
    let hl = ns.getHackingLevel();
    return getServers(ns)
        .sort(compareProfit)
        .filter(function(server) {
            let s = server.name;
            if (s.startsWith('darkweb') ||
                s.startsWith('home') ||
                s.startsWith('pserv') ||
                !server.hasRoot ||
                server.reqHacking > hl ||
                server.minSecLvl == 1 && server.moneyAvailable === 0
            ) return false;
            else
                return true;
        });

}