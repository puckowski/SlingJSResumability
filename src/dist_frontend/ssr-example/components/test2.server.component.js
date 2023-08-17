import { textNode, markup, getState, setState } from 'slingjs/sling.min.es5';

class Test2Component {
    constructor() {
        this.state = false;
    }

    functionToBeHydrated() {
        this.state = true;
    }

    boundaryTestSimple() { import(/* webpackChunkName: "chunkbfc68c965983669ce99802156944b4894515fb2226b087eeffcac85f53c7a89b" */ './chunkbfc68c965983669ce99802156944b4894515fb2226b087eeffcac85f53c7a89b.js').then(module => { module.default(); });}
    boundarySayHello() { import(/* webpackChunkName: "chunk3a511f61a7f7cb2b41ad539a437c724b3720f501c123bfca29c025e6260668c8" */ './chunk3a511f61a7f7cb2b41ad539a437c724b3720f501c123bfca29c025e6260668c8.js').then(module => { module.default(); });}

    boundarySecond() { import(/* webpackChunkName: "chunkfd33c8bf76d7bfdda9b5b8c933f061c954f137694ec44622055d9af2bdb3e8c3" */ './chunkfd33c8bf76d7bfdda9b5b8c933f061c954f137694ec44622055d9af2bdb3e8c3.js').then(module => { module.default(); });}

    boundaryDoubleClick() { import(/* webpackChunkName: "chunk8c8074f1c12c006eba884c932b543db80231d6f7177a47bf661340f934325a05" */ './chunk8c8074f1c12c006eba884c932b543db80231d6f7177a47bf661340f934325a05.js').then(module => { module.default(); });}

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
                        onclick: this.boundarySayHello.bind(this),
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
                        onclick: this.boundarySecond.bind(this),

 ondblclick: this.boundaryDoubleClick.bind(this),
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

