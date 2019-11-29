import {BitBurner as NS} from "Bitburner";

export async function main(ns: NS)
{
    while(ns.getFactionRep("Tian Di Hui") < 6250)
    {
        //@ts-ignore
        ns.workForFaction("Tian Di Hui", "hackingcontracts");
        await ns.sleep(60000);
    }
    while(ns.getFactionRep("NiteSec") < 12000)
    {
        //@ts-ignore
        ns.workForFaction("NiteSec", "hackingcontracts");
        await ns.sleep(60000);
    }
}