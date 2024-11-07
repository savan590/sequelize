class Parent {
    constructor() {
        this.type = 'Parent';
        this.name ='admin'
    }
    print() {
        console.log(this.type, this.name);
    }
}

class Child extends Parent {
    constructor(name) {
        super();
        this.type = 'child';
        this.name = name;
    }
}

class Child2 extends Child {
    constructor(name, age) {
        super();
        // this.type = 'child2';
        this.age = age;
        this.name = name
    }
    print() {
        console.log('This is a',this.type, this.name, this.age);
    }
}

class Child3 extends Parent {
    constructor(name) {
        super();
        this.type = 'child3';
        this.name = name;
    }
    print() {
        console.log('This is a',this.type, this.name);
    }
}

class Child4 extends Parent {
    constructor(name) {
        super();
        this.type = 'child4';
        this.name = name;
    }
    print() {
        console.log('This is a',this.type, this.name);
    }
}

const NameMixin = (B) => class F extends B {
    constructor(name) {
        super();
        this.name = name;
    }
    printName() {
        console.log('Name:', this.name);
    }
};

class Child5 extends NameMixin(Parent) {
    constructor(name) {
        super();
        this.name = name;
        // this.type = 'child5'
    }
    print() {
        console.log('parent class of this class is',this.type,this.name);
    }
}

const p = new Parent();
const c = new Child('A');
const c2 = new Child2('B', 23);
const c3 = new Child3('C');
const c4 = new Child4('D');
const c5 = new Child5('E');

p.print();         
c.print();         
c2.print();         
c3.print();       
c4.print();        
c5.print();        
c5.printName();  

