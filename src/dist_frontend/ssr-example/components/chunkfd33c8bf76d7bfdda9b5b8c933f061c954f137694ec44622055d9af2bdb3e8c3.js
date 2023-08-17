import { textNode, markup,      getState, setState }      from 'slingjs/sling.min.es5';
export function boundaryTestSimple() {
        console.log('simple');

    }export function boundarySayHello() {
        console.log('hello');
        console.log('1');  console.log('2'); 
        
        console.log('3');
        
        console.log('4');  console.log('end');
        this.boundaryTestSimple();
        const state = getState();
        if (state.second) {
            console.log('has state');
        }
    }export function boundaryDoubleClick() {
        console.log('double click');
    }
export function boundarySecond() {
        console.log('second');
        this.boundaryTestSimple();
        const state = getState();
        state.second = true;
        setState(state);
    } export default boundarySecond;