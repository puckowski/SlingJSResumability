import {
    textNode,
    markup
} from 'slingjs/sling.min.es5'; import Test2Component from './test2.server.component';

class Test3Component {

    boundarySimpleTwo() {
        console.log('simple two');
    }

    view() {
        return markup('div', {
            attrs: {
                id: 'divroot',
                slssrclass: 'Test3Component'
            },
            children: [
                markup('span', {
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
