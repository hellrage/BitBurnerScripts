import {BitBurner as NS} from "Bitburner";
export async function main(ns: NS) {
    let host = ns.args[0];
    let target = ns.args[1];
    if (host == "all")
        for (let h = 0; h < ns.getPurchasedServers().length; h++) {
            host = "pserv-" + h;
            await runWeakenLoop(ns, host, target);
        }
    else if(host == "free"){
        for (let h = 0; h < ns.getPurchasedServers().length; h++) {
            host = "pserv-" + h;
            await runWeakenLoop(ns, host, target, true);
        }
    }
    else
        await runWeakenLoop(ns,host,target);
}

async function runWeakenLoop(ns: NS, host, target, requireFree = false)
{
    ns.tprint(`Weaken running on Host: ${host} target: ${target}`);
    let ram = ns.getServerRam(host);
    if(requireFree && (ram[1]!=0))
        return;
    let availableRam = ram[0] - ram[1];
    let thr = Math.floor((availableRam) / 1.75);
    ns.tprint(`${thr} threads`);
    if(thr == 0)
        return;
    ns.scp("loopweaken.js", host);
    //@ts-ignore
    await ns.exec("loopweaken.js", host, thr, { target: target, threads: thr });
}