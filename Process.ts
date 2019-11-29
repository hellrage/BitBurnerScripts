export class Process {
    script: string;
    allowSplit: boolean;
    modules: number;
    threads: number;
    args: any;
    RAM: number;

    constructor(script: string, allowSplit: boolean, modules: number, threads: number, args: any, RAM: number) {
        this.script = script;
        this.allowSplit = allowSplit;
        this.modules = modules;
        this.threads = threads;
        this. args = args;
        this. RAM = RAM;
    }
}