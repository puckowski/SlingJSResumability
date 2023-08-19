


 import {     textNode,     markup } from 'slingjs/sling.min.es5';
 import Test2Component from './test2.server.component';
   

class Test3Component {

    boundarySimpleTwo() { import(/* webpackChunkName: "chunk04f821bf8d2ffcb57ba5bc531a2875bee25b87e611fff1a5d163987e0c134059" */ './chunk04f821bf8d2ffcb57ba5bc531a2875bee25b87e611fff1a5d163987e0c134059.js').then(module => { module.default(); });}

    view() {
        return markup('div',

 {
            attrs: {
                id: 'divroot',
                slssrclass: 'Test3Component'
            },
            children: [
                markup('span',

 {
                    attrs: {
                        onclick: this.boundarySimpleTwo.bind(this),
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

