import {BitBurner as NS} from "Bitburner";
import {
    cmd,
    getServers,
    getFacServers
} from "hhelper.js";

let facServers = getFacServers();

export async function main(ns: NS) {
    let output = "Network:";
    let search = ns.args[0] || "";
    let low = (search == "low") ? true : false;

    getServers(ns).forEach(server => {
        if(low && (server.reqHacking > ns.getHackingLevel() * 1.2))
            return;
        
        let name = server.name;
        let rootColor = server.hasRoot ? "lime" : "red";
        let hackColor = (server.reqHacking <= ns.getHackingLevel()) ? "lime" : "red";
        let nameColor = facServers[name] ? facServers[name] : ((name == search) ? "red" : "white");

        let moneyString = Math.round(server.moneyAvailable).toLocaleString();
        let moneyPercent = [" (",
            Math.round(100 * server.moneyAvailable / server.maxMoney), "%)"
        ].join("");
        let moneyColor = (moneyPercent == " (100%)") ? "lime" : "green";
        let hoverText = ["Req Level: ", server.reqHacking,
            "&#10;Req Ports: ", server.reqPorts,
        ].join("");
        let ttW = ns.getWeakenTime(name);
        let ctText = "";
        ns.ls(name, ".cct").forEach(ctName => {
            ctText += ["<a title='", ctName,
                //Comment out the next line to reduce footprint by 5 GB
                //"&#10;", ns.codingcontract.getContractType(ctName, name),
                "'>©</a>"
            ].join("");
        });
        var securityColor = (server.secLvl == server.minSecLvl) ? "LightBlue" : "SteelBlue";
        output += [
            `<br><font color='gray'>`,
            "| ".repeat(server.depth),
            `</font><font color=${rootColor}>■ </font>`,
            `</font><font color=${hackColor} title='${ttW}'>[${server.reqHacking}] </font>`,
            `<a class='scan-analyze-link' title='${hoverText}' style='color:${nameColor}'>${name}</a> `,
            `<font color='GreenYellow'>[${server.totalRAM}/${server.availableRAM}]</font>`,
            `<font color='fuchisa'>${ctText} </font>`,
            `<font color='${securityColor}'>[${server.secLvl}/${server.minSecLvl}] </font>`,
            `<font color='${moneyColor}' title='${moneyString}'>${moneyPercent}</font>`
        ].join("");
    });
    ns.tprint(output);
    cmd(ns, 'scan-analyze 0');
}

function buildScript() {
    return [
        `function testFunction() {`,
        `document.getElementById("terminal-input-text-box").value = "run SM.js ${name}";`,
        //let tscode = `document.getElementById("terminal-input-text-box").value += " ${name}";`;
        `document.body.dispatchEvent(new KeyboardEvent("keydown", {`,
        `bubbles: true, cancelable: true, keyCode: 13 }));`,
        `}`
    ].join("");
}