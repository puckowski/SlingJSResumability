import { mount } from 'slingjs/sling.min.es5';
import NavComponent from './ssr-example/components/nav.component';
import Test1Component from './ssr-example/components/test1.server.component';

window.Test1Component = Test1Component;

let compNav = new NavComponent();
mount('divnav', compNav);
