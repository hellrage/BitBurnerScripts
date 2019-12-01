import { BitBurner as NS } from "Bitburner";

export async function main(ns: NS) {


    while (true) {
        let serverStats: any = []
        for (let i = 0; i < 25; i++) {
            if (ns.serverExists('pserv-' + i) && ns.ps('pserv-' + i).length > 0)
                serverStats.push({
                    name: 'pserv-' + i,
                    index: i,
                    target: "None",
                    MoneyP: 0
                });
        }
        let report = '\n';
        for (let i = 0; i < serverStats.length; i++) {
            let s = serverStats[i];
            let prevTarget = s.target;
            let tscipts = ns.ps(s.name);
            //@ts-ignore
            s.target = (tscipts[0]).args[0].target;
            if (prevTarget !== s.target)
                s.MoneyP = 0;
            s.MoneyP = Math.floor((ns.getServerMoneyAvailable(s.target) / ns.getServerMaxMoney(s.target)) * 100);
            let secRep = Math.floor(ns.getServerSecurityLevel(s.target)) + "/" + ns.getServerMinSecurityLevel(s.target);
            report += [s.index,(s.index<10)?"   ":"  ", s.target + " ".repeat(20 - s.target.length), s.MoneyP + ' %', '\t', secRep].join("") + '\n';
        }
        ns.write("_pservperfstats.txt", report, "w");
        await ns.sleep(600);
    }
}