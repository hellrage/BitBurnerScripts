import {BitBurner as NS} from "Bitburner";

export async function main(ns: NS) {
    let scripts = [
        "SM7.js",
        "hhelper.js",
        "hscan.js",
        "buyServers.js",
        "BestServer.js",
        "DCLoopWeaken.js",
        "justLoopWeaken.js",
        "weakenNetwork.js",
        "infect.js",
        "AnalyzePurchasableAugs.js",
        "singularity.js",
        "FetchScripts.js",
        "Process.js",
        "GymTraining.js",
        "PServerPerformance.js",
        "KillEverything.js"
    ];

    for (let i = 0; i < scripts.length; i++) {
        await ns.wget(`http://localhost:12345/${scripts[i]}`, scripts[i]);
    }
}