import { mount } from 'slingjs/sling.min.es5';
import NavComponent from './ssr-example/components/nav.component';
import Test1Component from './ssr-example/components/test1.server.component';
import InfoComponent from './ssr-example/components/info.component';

window.Test1Component = Test1Component;

let compNav = new NavComponent();
mount('divnav', compNav);

let compInfo = new InfoComponent();
mount('divinfo', compInfo);
