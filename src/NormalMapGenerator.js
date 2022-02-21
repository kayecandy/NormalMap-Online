import { config } from "./config.js";
import { ThreeManager } from "./ThreeManager.js";



export class NormalMapGenerator{
    static _instance;
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
     * @returns {NormalMapGenerator}
     */
    static instance = function () {
        if (!NormalMapGenerator._instance)
            NormalMapGenerator._instance = new NormalMapGenerator();
        
        return NormalMapGenerator._instance;
    }

    
    /**
     * 
     * @param {HTMLImageElement} image 
     */
    generateFromImage(image, _config = config) {
        return this.threeManager.renderNormalImage(image, _config);
    }
}