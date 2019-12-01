import { BitBurner as NS } from "Bitburner";

export async function main(ns: NS) {
    let limit = ns.args[0] || 60;
    let gym = `Powerhouse Gym`;
    let statsToTrain = [`strength`, `defense`, `dexterity`, `agility`];
    for(let i = 0; i < statsToTrain.length; i++)
    {
        while (ns.getStats()[statsToTrain[i]] < limit) {
            //@ts-ignore
            ns.gymWorkout(gym, statsToTrain[i]);
            await ns.sleep(30000);
        }
    }
}