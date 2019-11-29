import {BitBurner as NS, AugmentPair} from "Bitburner";

export function main(ns: NS) {
    let cinfo = ns.getCharacterInformation();
    let freps = {};
    let augs = formAugmentationsList(ns, cinfo.factions, freps);

    augs.sort(function(a: AugmentPair, b) { return b.cost - a.cost; });
    //ns.tprint(`Total: ${ns.nFormat(calculateTotalCost(ns, augs), "$0.000a")}`);
    resolvePrereqs(ns, augs);
    augs.forEach(function(aug) {
        let color = (freps[aug.faction] > aug.repCost) ? "lime" : "red";
        //ns.tprint(`${aug.faction} - ${aug.name}, <font color = "${color}">${aug.repCost} rep.</font> ${ns.nFormat(aug.cost, "$0.000a")}`);
    });
    calculateTotalCost(ns, augs);
    //buyAugs(ns, augs);
}

function Augmentation(ns: NS, faction, name, prereqs) {
    let costs = ns.getAugmentationCost(name);
    return {
        faction: faction,
        name: name,
        repCost: costs[0],
        cost: costs[1],
        prereqs: prereqs
    };
}

function resolvePrereqs(ns: NS, augs) {
    for (let i = 0; i < augs.length; i++) {
        let aug = augs[i];
        if (aug.prereqs.length == 0) continue;
        let prereq = aug.prereqs[0];
        //ns.tprint(`Found a prereq for ${aug.name} : ${prereq}`);
        let pri = augs.findIndex(function(augment) { return augment.name == prereq; });
        if (pri != -1) {
            //ns.tprint(`Moving ${prereq} to ${i}`);
            let prerequisite = augs[pri];
            augs.splice(pri, 1);
            augs.splice(i, 0, prerequisite);
            i--;
            aug.prereqs = [];
        }
    }
}

function formAugmentationsList(ns, factions, freps) {
    let augs: any = [];
    debugger;
    factions.forEach(function(fac) {
        freps[fac] = ns.getFactionRep(fac);
        let faugs = ns.getAugmentationsFromFaction(fac);
        faugs.forEach(function(augment) {
            if (!augs.find(function(aug) { return aug.name == augment; }) &&
                !ns.getOwnedAugmentations().find(function(aug) { return aug == augment; }) &&
               ns.getAugmentationCost(augment)[0] <= freps[fac]
            ) {
                augs.push(Augmentation(ns, fac, augment, ns.getAugmentationPrereq(augment)));
            }
        });
    });
    return augs;
}

function calculateTotalCost(ns, augs) {
    let total = 0;
    let multiplier = 1;
    augs.forEach(function(aug) {
        total += aug.cost * multiplier;
        multiplier *= 1.9;
        ns.tprint(`${aug.faction} - ${aug.name}, ${aug.repCost} rep. total: ${ns.nFormat(total, "$0.000a")}`);
    });

    return total;
}

function buyAugs(ns: NS, augs) {
    augs.forEach(function(aug) {
        if (ns.getServerMoneyAvailable("home") >= aug.cost) {
            if (ns.purchaseAugmentation(aug.faction, aug.name))
                ns.tprint(`${aug.faction} - ${aug.name} bought!`);
            else
                ns.tprint(`Can't buy ${aug.faction} - ${aug.name}!`);
        } else
            ns.tprint(`Can't buy ${aug.faction} - ${aug.name}!`);
    });
}