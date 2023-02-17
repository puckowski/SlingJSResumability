import { textNode, markup } from 'slingjs/sling.min.es5';
import Test2Component from './test2.server.component';

class Test3Component {
    view() {
        return markup('div', {
            attrs: {
                id: 'divroot',
            },
            children: [
                markup('span', {
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
