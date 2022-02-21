/**
 * @readonly
 * @enum
 */
 export const NormalAlgorithm = {
    Sobel: 1,
    Scharr: 0
}

/**
 * @readonly
 * @enum
 */
export const InvertValues = {
    Invert: -1,
    NoInvert: 1
}

export const config = {
    strength: 0.13,
    level: 5.6,
    blur: -6,
    /**
     * @type {Enumerator<typeof NormalAlgorithm>}
     */
    type: NormalAlgorithm.Sobel,
    /**
     * @type {Enumerator<typeof InvertValues>}
     */
    invertR: InvertValues.NoInvert,
    /**
     * @type {Enumerator<typeof InvertValues>}
     */
    invertG: InvertValues.NoInvert,
     /**
     * @type {Enumerator<typeof InvertValues>}
     */
    invertH: InvertValues.NoInvert,

}
