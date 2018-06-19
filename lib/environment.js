class Environment {
    /**
     * @param {Environment} parent The environment which this environment resides in.
     * @param {string} name The name of the environment.
     */
    constructor(parent, name) {
        this.parent = parent;
        this.name = name || 'Unnamed environment';
        this.ids = {};
    }

    /**
     * Gets an item from this environment or any parent environment.
     * @param {string} name The name of the item to get.
     */
    getItem(name) {
        if (this.ids[name]) {
            return this.ids[name];
        } else if (this.parent) {
            return this.parent.getItem(name);
        } else {
            const error = new Error(`Reference to unassigned variable ${name}`);
            error.name = 'NullReference';
            throw error;
        }
    }

    /**
     * Sets an item in this environment.
     * @param {string} name The id of the item to set.
     * @param {any} value The value to set the item to.
     */
    setItem(name, value) {
        if (this.ids.hasOwnProperty(name)) {
            const error = new Error(`Assignment to existing variable ${name}`);
            error.name = 'VariableMutation';
            throw error;
        }
        this.ids[name] = value;
    }

    /**
     * Returns an array of strings describing this environment.
     */
    getInfo() {
        let result = [`@${this.name}`];
        const itemKeys = Object.keys(this.ids);
        if (itemKeys.length === 0) {
            result.push('  No items.');
            return result;
        }
        result.push(...itemKeys.map(k => `  ${k}: ${this.ids[k]}`));
        return result;
    }

    /**
     * Returns the distance from this environment to the global environment.
     */
    distance() {
        if (!this.parent) {
            return 0;
        } else {
            return 1 + this.parent.distance();
        }
    }
}
module.exports = Environment;
