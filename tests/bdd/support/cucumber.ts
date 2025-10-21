import { setDefaultTimeout, setWorldConstructor } from '@cucumber/cucumber';
import { TestWorld } from './world.js';

setWorldConstructor(TestWorld);
setDefaultTimeout(30_000);
