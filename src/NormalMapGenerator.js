import { config } from './config.js';
import { ThreeManager } from './ThreeManager.js';

export class NormalMapGenerator{
    /**
     * @private
     */
    static _instance;
    /**
     * @private
     * @type {ThreeManager}
     */
    threeManager;

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
        const __config = {
            ...config,
            ..._config
        }
        return this.threeManager.renderNormalImage(image, __config);
    }
}