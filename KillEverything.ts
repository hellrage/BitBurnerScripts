import { BitBurner as NS } from "Bitburner";
import { getServers } from "hhelper.js";

export async function main(ns: NS) {
    let servers = getServers(ns);

    for (let i = 0; i < servers.length; i++) {
        if (servers[i].name == "home")
            continue;
        ns.killall(servers[i].name);
    }
}