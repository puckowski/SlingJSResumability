

 import { textNode, markup,      getState, setState }      from 'slingjs/sling.min.es5';
 

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
        console.log('hello');
        console.log('1');  console.log('2'); 
        
        console.log('3');
        
        console.log('4');  console.log('end');
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

    boundaryDoubleClick() {
        console.log('double click');
    }

    view() {
        return markup('div',

 {
            attrs: {
                id: 'divrouteroutlet',
                slssrclass: 'Test2Component'
            },
            children: [
                markup('button',

 {
                    attrs: {
                        style: 'color: red',
                        onclick: " import('./chunk3a511f61a7f7cb2b41ad539a437c724b3720f501c123bfca29c025e6260668c8.js').then(module => { module.default(); });",
                        id: 'test1'
                    },
                    children: [
                        textNode('Call Hydrated Function')
                    ]
                }),
                ...(this.state === false ? [markup('div',

 {
                    attrs: {
                        style: 'color: blue;',
                        onclick: " import('./chunkfd33c8bf76d7bfdda9b5b8c933f061c954f137694ec44622055d9af2bdb3e8c3.js').then(module => { module.default(); });",

 ondblclick: " import('./chunk8c8074f1c12c006eba884c932b543db80231d6f7177a47bf661340f934325a05.js').then(module => { module.default(); });",
                    },
                    children: [
                        textNode('State false.')
                    ]
                })] : [
                    markup('div',

 {
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

