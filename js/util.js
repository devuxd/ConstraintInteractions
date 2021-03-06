/*
    RULE
 */

function Rule(inputs, prediction) {
    this.inputs = inputs;
    this.prediction = prediction;
    this.setInputs = function (inputs) {this.inputs = inputs};
    this.setPrediction = function(prediction) {this.prediction = prediction};
    this.getInputs = function() {return this.inputs;};
    this.getPrediction = function() {return this.prediction};
    this.getPredictionCase = function() {return (this.prediction === null ? null : Object.keys(this.prediction)[0])};
    this.getRule = function() {return {...this.inputs, ...this.prediction}};
    this.equalsRule = function(rule, strictEquality) {
        return kvpEquals(this.getRule(),rule.getRule(), strictEquality);
    };
    this.contradictsRule = function(rule) {
        return kvpEquals(this.getInputs(), rule.getInputs(), true) && !kvpEquals(this.getPrediction(), rule.getPrediction());
    };
    this.trimInputs = function() {
        const refinedInput = {};
        const inputs = this.inputs;
        const componentKeys = Object.keys(inputs);
        for (const key of componentKeys) {
            const val = inputs[key];
            if (val !== '') {
                refinedInput[key] = val;
            }
        }
        this.inputs = refinedInput;
    };
}

function containsRule(rule, list, strictEquality){
    for (let i = 0; i < list.length; i++ ){
        if (rule.equalsRule(list[i], strictEquality)) {
            return true;
        }
    }
    return false;
}

/*
    What: Whether the key-value pairs for the objects are equal/matched
    How:
        1. If strict equality desired AND number of KVPs is different, false
        2. For each key in one, if value in that and other are different, false
 */
function kvpEquals(obj1, obj2, strictEquality){
    let obj1First = true;
    let a = Object.getOwnPropertyNames(obj1);
    let b = Object.getOwnPropertyNames(obj2);
    if (strictEquality && (a.length !== b.length)) {
        return false;
    }
    if (!strictEquality) obj1First = a.length <= b.length;
    const objFirst = obj1First ? obj1 : obj2;
    const objSecond = obj1First ? obj2 : obj1;
    const props = obj1First ? a : b;
    for (let i = 0; i < props.length; i++) {
        const name = props[i];
        if (objFirst[name] !== objSecond[name]) {
            return false;
        }
    }
    return true;
}

/*
    TEXT
 */

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toPredictionHeader(predictionCase) {
    return '&#10132 ' + capitalizeFirstLetter(predictionCase);
}

/*
    What: Formats a rule component in plaintext
    @param {Object} ruleComponent - component to be formatted
    @param {Boolean} isConditions - true if conditions, false if prediction
    @return {String} plaintext - converted
 */
function toPlaintext(ruleComponent, isConditions, predictionCase) {
    if (isConditions) {

        let temp = new Rule(ruleComponent, null);
        temp.trimInputs();
        ruleComponent = temp.getInputs();

        let parentConditions = '';
        let elementConditions = '';
        const parentHandler = {};
        const elementHandler = {};

        let hasParentTag = false;
        let hasParentAttributeValue = false;
        let hasTag = false;
        let hasAttribute = false;

        const keys = Object.keys(ruleComponent);
        for (const key of keys) {
            const value = ruleComponent[key];
            switch(key) {
                case 'parentTag': hasParentTag = true; parentHandler[key] = value; break;
                case 'parentAttributeValue': hasParentAttributeValue = true;  parentHandler[key] = value; break;
                case 'tag': hasTag = true;  elementHandler[key] = value; break;
                case 'attribute': hasAttribute = true; elementHandler[key] = value; break;
            }
        }

        if (!_.isEmpty(parentHandler)) {
            if (hasParentTag && hasParentAttributeValue) {
                let parentAttributeValue = parentHandler.parentAttributeValue.replace("="," = '")+"'";
                parentConditions = ('<' + parentHandler.parentTag + ' ' + parentAttributeValue + '>');
            } else if (hasParentTag && !hasParentAttributeValue) {
                parentConditions = ('<' + parentHandler.parentTag + '>');
            } else {
                let parentAttributeValue = parentHandler.parentAttributeValue.replace("="," = '")+"'";
                parentConditions = ('<tag ' + parentAttributeValue + '>');
            }
        }

        if (!_.isEmpty(elementHandler)) {
            if (hasTag && hasAttribute) {
                elementConditions = ('<' + elementHandler.tag + ' ' + elementHandler.attribute);
            } else if (hasTag) {
                elementConditions = ('<' + elementHandler.tag);
            } else {
                elementConditions = ('<tag ' + elementHandler.attribute);
            }
        }

        let plaintext;
        if (!_.isEmpty(parentHandler) && !_.isEmpty(elementHandler)) {
            plaintext = 'Parent: ' + parentConditions;
            plaintext += ' AND ';
            plaintext += 'Element: ' + elementConditions;
        } else if (!_.isEmpty(parentHandler)) {
            plaintext = 'Parent: ' + parentConditions;
        } else if (!_.isEmpty(elementHandler)) {
            plaintext = 'Element: ' + elementConditions;
        } else {
            switch (predictionCase) {
                case PREDICTION_CASE.TAG:
                    plaintext = 'Parent: <tag>';
                    break;
                case PREDICTION_CASE.ATTRIBUTE:
                    plaintext = 'Element: <tag';
                    break;
                case PREDICTION_CASE.VALUE:
                    plaintext = 'Element: <tag attribute';
                    break;
            }
        }
        return _.escape(plaintext);

    } else {
        return ruleComponent[predictionCase];
    }
}

/*
    RULE RANKING
 */

/*
    What: Whitelists rule if not whitelisted already
    @param {Rule} rule - Rule to be whitelisted
 */
function whitelist(rule) {
    const relevantWhitelist = storage.whitelist[rule.getPredictionCase()];
    if (containsRule(rule, relevantWhitelist, true)) {
        alert('Error: Rule is already whitelisted.');
    } else {
        relevantWhitelist.push(rule);
    }
}

/*
    What: Blacklists rule if not blacklisted already
    @param {Rule} rule - Rule to be blacklisted
 */
function blacklist(rule) {
    const relevantBlacklist = storage.blacklist[rule.getPredictionCase()];
    if (containsRule(rule, relevantBlacklist, true)) {
        alert('Error: Rule is already blacklisted.');
    } else {
        relevantBlacklist.push(rule);
    }
}

/*
    What: Removes rule from whitelist
    How: Uses deep equality to find and remove the first match
    @param {Rule} rule - Rule to be un-whitelisted
 */
function unWhitelist(rule) {
    const relevantWhitelist = storage.whitelist[rule.getPredictionCase()];
    for (let i = 0; i < relevantWhitelist.length; i++) {
        const whitelistRule = relevantWhitelist[i];
        if (whitelistRule.equalsRule(rule, true)) {
            relevantWhitelist.splice(i, 1);
            return;
        }
    }
    alert('Error: Rule not found on whitelist.');
}

/*
    What: Removes rule from blacklist
    How: Uses deep equality to find and remove the first match
    @param {Rule} rule - Rule to be un-whitelisted
 */
function unBlacklist(rule) {
    const relevantBlacklist = storage.blacklist[rule.getPredictionCase()];
    for (let i = 0; i < relevantBlacklist.length; i++) {
        const blacklistRule = relevantBlacklist[i];
        if (blacklistRule.equalsRule(rule, true)) {
            relevantBlacklist.splice(i, 1);
            return;
        }
    }
    alert('Error: Rule not found on blacklist.');
}