import {BitBurner as NS} from "Bitburner";

export async function main(ns: NS) {
    if (ns.args.length !== 2) {
        ns.tprint("Usage: buyServers amount ram");
        return;
    }
    let amnt = ns.args[0];
    let ram = ns.args[1];
    let limit = ns.getPurchasedServerLimit();


    if (typeof(amnt) == 'string') {
        if (amnt.toLowerCase() == "all")
            amnt = limit;
        else if (amnt.toLowerCase() == "cost")
            amnt = 1;
    }

    if (amnt > limit)
        amnt = limit;

    let funds = ns.getServerMoneyAvailable(`home`);
    if (typeof(ram) == 'string') {
        if (ram.toLowerCase() == "max") {
            ram = maxRAM(ns, funds, amnt);
        }
        else if (ram.toLowerCase() == "maximum")
            ram = ns.getPurchasedServerMaxRam();
    }

    ns.tprint(`Buying ${amnt} servers with ${ram} RAM for ${ns.nFormat(cost(ram, amnt), "$0.000a")}`);
    if (ns.args[0] == "cost")
        return;

    let ownedServers = ns.getPurchasedServers();
    let startIndex = 0;
    if (ownedServers.length < limit)
        startIndex = ownedServers.length;
    let i = startIndex;
    while (amnt > 0 && funds >= cost(ram, 1)) {
        let sname = 'pserv-' + i;
        if (await buyServer(ns, ram, sname)) {
            ns.tprint("Bought " + sname);
            amnt--;
        }
        i++;
        if (i >= limit)
            i = 0;
        if (i == startIndex) {
            ns.tprint(`Looped around, can't upgrade any more servers! ${amnt} unbought`);
            return;
        }
    }
}

export function cost(ram: number, number = 1) {
    const BASE_SERVER_COST = 55000;
    return BASE_SERVER_COST * ram * number;
}

export function maxRAM(ns: NS, funds: number, number = 1) {
    let ram = 1;
    let maxPurchasedRAM = ns.getPurchasedServerMaxRam();
    while (funds >= cost(ram * 2, number) && (ram * 2 <= maxPurchasedRAM)) {
        ram *= 2;
    }
    return ram;
}

export async function buyServer(ns: NS, ram: number, name = "") {
    if (cost(ram) > ns.getServerMoneyAvailable(`home`))
        return "";

    if (ns.serverExists(name)) {
        if (ns.getServerRam(name)[0] >= ram) {
            return "";
        }
        await ns.killall(name);
        ns.deleteServer(name);
    }
    return ns.purchaseServer(name, ram);
}