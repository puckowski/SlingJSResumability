


 import {     textNode,     markup } from 'slingjs/sling.min.es5';
 import Test2Component from './test2.server.component';
   

class Test3Component {

    boundarySimpleTwo() {
        console.log('simple two');
    }

    view() {
        return markup('div',

 {
            attrs: {
                id: 'divrouteroutlet',
                slssrclass: 'Test3Component'
            },
            children: [
                markup('span',

 {
                    attrs: {
                        onclick: " import('./chunk04f821bf8d2ffcb57ba5bc531a2875bee25b87e611fff1a5d163987e0c134059.js').then(module => { module.default(); });",
                    },
                    children: [
                        textNode('Root text')
                    ]
                }),
                new Test2Component(),
                textNode('Text node')
            ]
        })
    }
}

export default Test3Component;

