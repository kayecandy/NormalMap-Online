
import { config } from "./config";
import { ThreeManager } from "./ThreeManager";



export class NormalMapGenerator{
    /**
     * @type {ThreeManager}
     */
    threeManager;


    nmoRenderNormalview;
    nmoNormalMap;

    constructor() {
        this.threeManager = new ThreeManager();
    }

    
    /**
     * 
     * @param {HTMLImageElement} image 
     */
    generateFromImage(image) {
        return this.threeManager.renderNormalImage(image, config);
    }
}