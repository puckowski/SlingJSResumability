import { textNode, markup } from 'slingjs/sling.min.es5';

class Test4Component {
    constructor() {
        this.state = false;
    }

    functionToBeHydrated() {
        this.state = true;
    }

    view() {
        return markup('div', {
            attrs: {
                id: 'divrouteroutlet',
                slssrclass: 'Test4Component'
            },
            children: [
                markup('button', {
                    attrs: {
                        style: 'color: red',
                        onclick: this.functionToBeHydrated.bind(this),
                        id: 'test1'
                    },
                    children: [
                        textNode('Call Hydrated Function')
                    ]
                }),
                ...(this.state === false ? [markup('div', {
                    attrs: {
                        style: 'color: blue;',
                    },
                    children: [
                        textNode('State false.')
                    ]
                })] : [
                    markup('div', {
                        attrs: {
                            style: 'color: green;'
                        },
                        children: [
                            textNode('State true.')
                        ]
                    })
                ]),
            ]
        })
    }
}

export default Test4Component;
