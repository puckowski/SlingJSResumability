import { textNode, markup, getState, setState } from 'slingjs/sling.min.es5';

class Test5Component {
    constructor() {

    }

    slStyle() {
        return 'div { background-color: gray; }';
    }

    functionToBeHydrated() {
        const state = getState();

        if (state.toggled === null || state.toggled === undefined) {
            state.toggled = true;
        } else {
            state.toggled = !state.toggled;
        }

        setState(state);
    }

    view() {
        const state = getState();

        return markup('div', {
            attrs: {
                id: 'divrouteroutlet',
                slssrclass: 'Test5Component'
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
                ...(state.toggled !== true ? [markup('div', {
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

export default Test5Component;
