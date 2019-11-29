import { BitBurner as NS } from "Bitburner";
import { Process } from "Process";
//Covers the whole screen in a blank square. When the mouse moves 
//over it, the square disappears and the command is executed.
export function inject(ns: NS, code: string) {
    let id = '' + Math.random() + Math.random();
    let output = `<div id="${id}" style="position:absolute; width:100%; height:100%" `;
    output += `onmouseover="${code} document.getElementById(\'${id}\').remove();"></div>`;
    ns.tprint(output);
}

export function cmd(ns: NS, cmd: string) {
    let code = `document.getElementById('terminal-input-text-box').value = '${cmd}';`;
    code += "document.body.dispatchEvent(new KeyboardEvent('keydown', {";
    code += "bubbles: true, cancelable: true, keyCode: 13 }));";
    inject(ns, code);
}

export function getFacServers() {
    return {
        "CSEC": "yellow",
        "avmnite-02h": "yellow",
        "I.I.I.I": "yellow",
        "run4theh111z": "yellow",
        "The-Cave": "orange",
        "w0r1d_d43m0n": "red"
    };
}

export function compareHackingLvl(a, b) {
    return a.reqHacking - b.reqHacking;
}

export function compareProfit(a, b) {
    return a.profit - b.profit;
}

export function hackSuccChance(ns, s) {
    return ns.hackChance(s) / 100;
}

export function sortByHackingLvl(servers) {
    return servers.sort(compareHackingLvl);
}

export class Server {
    name: string;
    depth: number;
    reqHacking: number;
    reqPorts: number;
    hasRoot: boolean;
    totalRAM: number;
    availableRAM: number;
    secLvl: number;
    minSecLvl: number;
    moneyAvailable: number;
    maxMoney: number;
    hackTime: number;
    hackSuccessChance: number;
    profit: number;
    processes: Process[];

    constructor(name: string, depth: number, reqHacking: number, reqPorts: number, hasRoot: boolean, RAM: number[], secLvl: number, minSecLvl: number, moneyAvailable: number, maxMoney: number, hackTime: number, hackSuccessChance: number, profit: number) {
        this.name = name;
        this.depth = depth;
        this.reqHacking = reqHacking;
        this.reqPorts = reqPorts;
        this.hasRoot = hasRoot;
        this.totalRAM = RAM[0];
        this.availableRAM = RAM[0] - RAM[1];
        this.secLvl = secLvl;
        this.minSecLvl = minSecLvl;
        this.moneyAvailable = moneyAvailable;
        this.maxMoney = maxMoney;
        this.hackTime = hackTime;
        this.hackSuccessChance = hackSuccessChance;
        this.profit = profit;
        this.processes = [];
    }
}


let svObj = (name = 'home', depth = 0) => ({
    name,
    depth
});
export function getServers(ns: NS) {
    let result: Server[] = [];
    let visited = {
        'home': 0
    };
    let queue = Object.keys(visited);
    let name;
    while ((name = queue.pop())) {
        let depth = visited[name];
        result.push(new Server(
            name,
            depth,
            ns.getServerRequiredHackingLevel(name),
            ns.getServerNumPortsRequired(name),
            ns.hasRootAccess(name),
            ns.getServerRam(name),
            ns.getServerSecurityLevel(name),
            ns.getServerMinSecurityLevel(name),
            ns.getServerMoneyAvailable(name),
            ns.getServerMaxMoney(name),
            Math.ceil(ns.getHackTime(name)),
            hackSuccChance(ns, name),
            profit(ns, name)
        ));
        let scanRes = ns.scan(name);
        for (let i = scanRes.length; i >= 0; i--) {
            if (visited[scanRes[i]] === undefined) {
                queue.push(scanRes[i]);
                visited[scanRes[i]] = depth + 1;
            }
        }
    }
    return result;
}

function profit(ns: NS, name: string) {
    let HT = ns.getHackTime(name);
    if (HT / 4 < 0.8)
        return 0;
    return Math.floor(ns.getServerMaxMoney(name) * ns.hackAnalyzePercent(name) * hackSuccChance(ns, name) * ns.getServerGrowth(name));
}

function formWorkerGroup(ns: NS, workers: Server[], processes: Process[], allowPartial = false) {
    let DEBUG = false;
    let assigned = 0;
    let clonedProcesses = JSON.parse(JSON.stringify(processes));
    debugger;
    for (let p = 0; p < clonedProcesses.length; p++) {
        for (let rs = 0; rs < workers.length; rs++) {
            let worker = workers[rs];
            let pRAM = clonedProcesses[p].RAM * clonedProcesses[p].threads * clonedProcesses[p].modules;
            if (pRAM <= worker.availableRAM) {
                worker.availableRAM -= pRAM;
                worker.processes.push(clonedProcesses[p]);
                assigned++;
                if (DEBUG) ns.tprint(`Added process ${clonedProcesses[p].script} into ${worker.name}, ${worker.availableRAM}GB left.`);
                break;
            } else if (clonedProcesses[p].allowSplit) {
                if (DEBUG) ns.tprint(`${p} - ${clonedProcesses[p].script} allows splitting...Trying to fit in ${worker.name} with ${worker.availableRAM}GM of free RAM.`);
                clonedProcesses[p].threads *= clonedProcesses[p].modules;
                clonedProcesses[p].modules = 1;
                let newThreads = Math.floor(worker.availableRAM / clonedProcesses[p].RAM);
                if (newThreads < 1) {
                    continue;
                }
                worker.availableRAM -= clonedProcesses[p].RAM * newThreads;
                let splitProcess = JSON.parse(JSON.stringify(clonedProcesses[p]));
                splitProcess.args = JSON.parse(JSON.stringify(clonedProcesses[p].args));
                if (splitProcess.args.threads)
                    splitProcess.args.threads = newThreads;
                splitProcess.threads = newThreads;
                worker.processes.push(splitProcess);
                clonedProcesses[p].threads -= newThreads;
                if (clonedProcesses[p].args.threads)
                    clonedProcesses[p].args.threads -= newThreads;
                if (DEBUG) ns.tprint(`Reduced process ${p}-${clonedProcesses[p].script} to ${clonedProcesses[p].threads} and added ${newThreads} to ${worker.name}.`);
                continue;
            }
        }
    }
    if ((assigned < processes.length) && !allowPartial) {
        //ns.tprint(`Can't DCRun this! Failed to assign all processes`);
        return [];
    }
    let group = workers.filter(function (server) { return server.processes.length > 0; });
    if (group.length > 0)
        return group;
    else
        return [];
}

export function availableWorkers(ns: NS) {
    let rootedServers = getServers(ns).filter(server => { return (server.hasRoot && (server.availableRAM > 0)); });
    let dcRAM = 0;
    let rsl = rootedServers.length;
    for (let rs = 0; rs < rsl; rs++) {
        dcRAM += rootedServers[rs].availableRAM;
    }
    return { freeRAM: dcRAM, workers: rootedServers };
}

export async function DCRun(ns: NS, processes: Process[], allowPartial = false) {
    let DEBUG = false; //true;

    let reqRAM = 0;
    let pl = processes.length;
    for (let p = 0; p < pl; p++) {
        if (processes[p].RAM)
            reqRAM = processes[p].RAM * processes[p].threads * processes[p].modules;
        else {
            return {
                "success": false,
                "result": `No RAM cost set for ${processes[p].script}, aborting!`
            };
        }
    }

    let workersInfo = availableWorkers(ns);
    if (workersInfo.freeRAM < reqRAM)
        return {
            "success": false,
            "result": `Not enough total RAM available, aborting!`
        };

    processes.sort(function (a, b) { return b.RAM - a.RAM; });
    workersInfo.workers.sort(function (a, b) {
        return b.availableRAM - a.availableRAM;
    });

    let workerGroup = formWorkerGroup(ns, workersInfo.workers, processes, allowPartial);

    if (workerGroup.length > 0) {

        for (let w = 0; w < workerGroup.length; w++) {
            let worker = workerGroup[w];
            for (let p = 0; p < worker.processes.length; p++) {
                let proc = worker.processes[p];
                ns.scp(proc.script, worker.name);
                await ns.exec(proc.script, worker.name, proc.threads * proc.modules, proc.args);
                if (DEBUG) ns.tprint(`Launched ${proc.script} on ${worker.name}`);
            }
        }
        return {
            "success": true,
            "result": "Launched all processes"
        };
    }

    return {
        "success": false,
        "result": `Couldn't form the worker group!`
    };
}