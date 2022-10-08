import { textNode, markup, getState, setState } from 'slingjs/sling.min.es5';

class Test2Component {
    constructor() {
        this.state = false;
    }

    functionToBeHydrated() {
        this.state = true;
    }

    boundaryTestSimple() {
        console.log('simple');

    }
    boundarySayHello() {
        console.log('hello'); // test
        console.log('1'); /* test2 
        */ console.log('2'); /* test5 */
        // test3
        console.log('3');
        /* test4 */
        console.log('4'); /* test6
        test7
        */ console.log('end');
        this.boundaryTestSimple();
        const state = getState();
        if (state.second) {
            console.log('has state');
        }
    }

    boundarySecond() {
        console.log('second');
        this.boundaryTestSimple();
        const state = getState();
        state.second = true;
        setState(state);
    }

    view() {
        return markup('div', {
            attrs: {
                id: 'divrouteroutlet',
                slssrclass: 'Test2Component'
            },
            children: [
                markup('button', {
                    attrs: {
                        style: 'color: red',
                        onclick: this.boundarySayHello.bind(this),
                        id: 'test1'
                    },
                    children: [
                        textNode('Call Hydrated Function')
                    ]
                }),
                ...(this.state === false ? [markup('div', {
                    attrs: {
                        style: 'color: blue;',
                        onclick: this.boundarySecond.bind(this),
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

export default Test2Component;
