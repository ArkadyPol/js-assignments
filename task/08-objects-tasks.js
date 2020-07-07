'use strict';

/**************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 **************************************************************************************************/


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    var r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
    this.width = width;
    this.height = height;
}
Rectangle.prototype.getArea = function() {
    return this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
    return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    var r = fromJSON(Rectangle.prototype, '{"width":10, "height":20}');
 *
 */
function fromJSON(proto, json) {
    let obj = Object.create(proto);
    return Object.assign(obj, JSON.parse(json));
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy and implement the functionality
 * to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple, clear and readable as possible.
 *
 * @example
 *
 *  var builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()  => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()  => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()        =>    'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CSSSelector {
    constructor(value, type, remainder = '') {
        this.value = remainder;

        switch (type[0]) {
            case 'element': {
                this.value += value;
                break;
            }
            case 'id': {
                this.value += `#${value}`;
                break;
            }
            case 'class': {
                this.value += `.${value}`;
                break;
            }
            case 'attr': {
                this.value += `[${value}]`;
                break;
            }
            case 'pseudoClass': {
                this.value += `:${value}`;
                break;
            }
            case 'pseudoElement': {
                this.value += `::${value}`;
                break;
            }
        }   
        this.type = type;
        this.checkUniqueness();
        this.checkOrder();
    }

    stringify() {
        return this.value;
    }
    
    get id() {
        return (value) => {
           return new CSSSelector(value, ['id', ...this.type], this.value);
        };
    }
    
    get class() {
        return (value) => {
           return new CSSSelector(value, ['class', ...this.type], this.value);
        };
    }
    
    get attr() {
        return (value) => {
           return new CSSSelector(value, ['attr', ...this.type], this.value);
        };
    }

    get element() {
        return (value) => {
            return new CSSSelector(value, ['element', ...this.type], this.value);
         };
    }

    get pseudoClass() {
        return (value) => {
            return new CSSSelector(value, ['pseudoClass', ...this.type], this.value);
         };
    }

    get pseudoElement() {
        return (value) => {
            return new CSSSelector(value, ['pseudoElement', ...this.type], this.value);
         };
    }

    checkUniqueness() {
        const error = 'Element, id and pseudo-element should not occur more then one time inside the selector';

        if (this.type.filter(x => x === 'element').length > 1) {
            throw new Error(error);
        }
        if (this.type.filter(x => x === 'id').length > 1) {
            throw new Error(error);
        }
        if (this.type.filter(x => x === 'pseudoElement').length > 1) {
            throw new Error(error);
        }
    }

    checkOrder() {
        const error = 'Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element';
        const order = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'];
        let currentType = this.type[0];
        let highestIndex = 0;
        for (let type of this.type.slice(1)) {
           if (order.indexOf(type) > highestIndex) highestIndex = order.indexOf(type);
        }
        if (order.indexOf(currentType) < highestIndex) {
            throw new Error(error);
        }
    }

    static combine (selector1, combinator, selector2) {
        let value = `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
        return new CSSSelector('' , ['element'], value);
    }
}

const cssSelectorBuilder = {

    element: function(value) {
        return new CSSSelector(value, ['element']);
    },

    id: function(value) {
        return new CSSSelector(value, ['id']);
    },

    class: function(value) {
        return new CSSSelector(value, ['class']);
    },

    attr: function(value) {
        return new CSSSelector(value, ['attr']);
    },

    pseudoClass: function(value) {
        return new CSSSelector(value, ['pseudoClass']);
    },

    pseudoElement: function(value) {
        return new CSSSelector(value, ['pseudoElement']);
    },

    combine: function(selector1, combinator, selector2) {
        return CSSSelector.combine(selector1, combinator, selector2);
    },
};


module.exports = {
    Rectangle: Rectangle,
    getJSON: getJSON,
    fromJSON: fromJSON,
    cssSelectorBuilder: cssSelectorBuilder
};
