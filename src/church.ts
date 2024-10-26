import { GChurch } from "./GChurch";

export namespace CHURCH {
    let churches: GChurch[] = [];

    export function addChurch(church: GChurch) {
        churches.push(church);
    }

    export function getChurches() {
        return churches;
    }
}