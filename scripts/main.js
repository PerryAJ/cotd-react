var React = require('react');
var ReactDOM = require('react-dom');
var ReactRouter = require('react-router');

var CSSTransitionGroup = require('react-addons-css-transition-group');

// React Router helps with url routing to components
var Router = ReactRouter.Router
var Route = ReactRouter.Route
var Navigation = ReactRouter.Navigation
var History = ReactRouter.History;

// Rebase, to bind React to Firebase
var Rebase = require('re-base');
var base = Rebase.createClass('https://perryscatchapp.firebaseio.com/');

// Catalyst library provides two-way data binding by allowing LinkState with nested objects
var Catalyst = require('react-catalyst');

/* allows react router to utilize html 5 push state on browsers that don't yet support it */
var createBrowserHistory = require('history/lib/createBrowserHistory');

// utility classes
var helpers = require('./helpers');

var App = React.createClass({
    mixins : [Catalyst.LinkedStateMixin],

    getInitialState : function() {
        return {
            fishes : {},
            order : {}
        }
    },

    componentDidMount : function() {
        base.syncState(this.props.params.storeId + '/fishes', {
            context : this,
            state : 'fishes'
        });

        var localStorageReference = localStorage.getItem('order-' + this.props.params.storeId);
        if (localStorageReference){
            this.setState({
                order: JSON.parse(localStorageReference)
            });
        } 
    },

    componentWillUpdate: function(nextProps, nextState){
        localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
    },

    addFish : function(fish) {
        var timestamp = (new Date()).getTime();
        // update state object
        this.state.fishes['fish-' + timestamp] = fish;

        // sets the state, pass in what changes in the state.  
        this.setState({ fishes : this.state.fishes });
    },

    addToOrder : function(key){
        this.state.order[key] = this.state.order[key] + 1 || 1;
        this.setState(this.state.order);
    },

    deleteFish : function(key){
        if(confirm("Are you sure you want to delete " + this.state.fishes[key].name)){
           this.state.fishes[key] = null;
            this.setState(this.state.fishes);
        }
    },

    deleteFromOrder : function(key){
        delete this.state.order[key];
        this.setState({
            order : this.state.order
        });
    },

    loadSamples : function() {
        this.setState({
            fishes : require('./sample-fishes')
        });
    },

    renderFishList : function(key){
        return <Fish key={key} index={key} details={this.state.fishes[key]} addToOrder={this.addToOrder} />
    },

    render : function() {
        return (
            <div className="catch-of-the-day">
                <div className="menu">
                    <Header tagline="Fresh Seafood Market"/>
                    <ul className="list-of-fishes">
                    {/* loop over items in plain javascript, using Object.keys to get an array of our fishes object's keys*/}
                    {Object.keys(this.state.fishes).map(this.renderFishList)}
                    </ul>
                </div>
                <Order fishes={this.state.fishes} order={this.state.order} deleteFromOrder={this.deleteFromOrder}/>

                {/* addFish declared in App, but needs to be passed to AddFishForm, so it's handed through Inventory via props */}
                <Inventory addFish={this.addFish} loadSamples={this.loadSamples} fishes={this.state.fishes} linkState={this.linkState} deleteFish={this.deleteFish}/>
            </div>
        )
    }
});


/*
    Fish Component 
    <Fish />
*/  
var Fish = React.createClass({
    onButtonClick : function(){
        console.log(this.props.index + " is going to be added.");
        var key = this.props.index;
        this.props.addToOrder(key);
    },

    render : function() {
        var details = this.props.details;
        var isAvailable = (details.status === 'available' ? true : false);
        var buttonText = (isAvailable ? "Add To Order" : "Sold Out");

        return (
            <li className="menu-fish">
                <img src={details.image} alt={details.name}/>
                <h3 className="fish-name">
                    {details.name}
                    <span className="price">{helpers.formatPrice(details.price)}</span>
                </h3>
                <p>{details.desc}</p>
                <button disabled={!isAvailable} onClick={this.onButtonClick}>{buttonText}</button>
            </li>
        )
    }
});



/*
    Inventory -- renders a form to add fish.
    <Inventory />
*/
var Inventory = React.createClass({
    renderInventory : function(key) {
        var linkState = this.props.linkState;
        return (
            <div className="fish-edit" key={key}>
                <input type="text"  valueLink={linkState('fishes.'+key+'.name')}/>
                <input type="text"  valueLink={linkState('fishes.'+key+'.price')}/>
                <select ref="status" valueLink={linkState('fishes.'+key+'.status')}>
                    <option value="available">Fresh!</option>
                    <option value="unavailable">Sold Out!</option>
                </select>
                <textarea type="text" className="description" valueLink={linkState('fishes.'+key+'.desc')}/>
                <input type="text"  valueLink={linkState('fishes.'+key+'.image')}/>
                <button onClick={this.props.deleteFish.bind(null, key)}>Delete</button>

            </div>
        )
    },

    render : function() {
        return (
            <div>
                <h2>Inventory</h2>
                
                {Object.keys(this.props.fishes).map(this.renderInventory)}
                
                <AddFishForm addFish={this.props.addFish} />
                <button onClick={this.props.loadSamples}>Load Sample Fishes</button>
            </div>      
        )
    }
});


/*
 * Add Fish Form
 */
var AddFishForm = React.createClass({

    createFish : function(event) {
        // prevent default html form submission
        event.preventDefault();
        
        //take the data from the form and create the object 
        var fish = {
            name : this.refs.name.value,
            price : this.refs.price.value,
            status : this.refs.status.value,
            desc : this.refs.desc.value,
            image : this.refs.image.value
        }

        // need to pass the method the form
        this.props.addFish(fish);
        this.refs.fishForm.reset();
    },

    render: function() {
        return (
            <form className="fish-edit" ref="fishForm" onSubmit={this.createFish}>
                <input type="text" ref="name" placeholder="Fish Name" />
                <input type="text" ref="price" placeholder="Fish Price" />
                <select ref="status">
                    <option value="available">Fresh!</option>
                    <option value="unavailable">Sold Out!</option>
                </select>
                <textarea type="text" ref="desc" placeholder="Desc"></textarea>
                <input type="text" ref="image" placeholder="URL to Image"/>
                <button type="submit">+ Add Item</button>
            </form>
        )
    }
});


/*
 *   Order
 *  <Order />
 */
var Order = React.createClass({
    renderOrder : function(key) {
        var fish = this.props.fishes[key];
        var count = this.props.order[key];

        var removeButton = <button className="delete-from-order-btn" onClick={this.props.deleteFromOrder.bind(null, key)}>&times;</button>
        
        if (!fish){
            return <li key={key}>Sorry, no longer available! {removeButton}</li>
        }
        var itemTotal = helpers.formatPrice(parseInt(fish.price) * parseInt(count));
        return (
            <li key={key}>
                <p>{fish.name}</p>
                <span>
                    <p>{count} lbs. x {helpers.formatPrice(fish.price)} = <strong>{itemTotal}</strong>{removeButton}</p>
                    
                </span>
            </li>
        )
    },

    render : function() {
        var orderIds = Object.keys(this.props.order);
        var total = orderIds.reduce((prevtotal, key)=> {
            var fish = this.props.fishes[key];
            var count = this.props.order[key];
            var isAvailable = fish && fish.status === "available";

            if (fish && isAvailable){
                return prevtotal + (count * parseInt(fish.price) || 0);
            }

            return prevtotal;
        }, 0);

        return (
            <div className="order-wrap">
                <h2 className="order-title">Your Order</h2>
                {/* Need to apply transition group to the parent of what we want to animate */}
                {/* in this case, we are animating li, so need to make group parent ul */}
                <CSSTransitionGroup 
                        className="order" 
                        component="ul" 
                        transitionName="order"
                        transitionEnterTimeout={5000}
                        transitionLeaveTimeout={5000}
                    >
                    {orderIds.map(this.renderOrder)}
                    <li className="total">
                        <strong>Total :</strong>
                        {helpers.formatPrice(total)}
                    </li>

                </CSSTransitionGroup>
            </div>
        )
    }
});



/*
 *
 *
 */
var Header = React.createClass({
    render : function() {
        return (
            <header className="top">
                <h1>Catch
                <span className="ofThe">
                    <span className="of">of</span>
                    <span className="the">The</span>
                </span>
                Day</h1>
                <h3 className="tagline">{this.props.tagline}</h3>
            </header>
        )
    }
});



/*
 * Store picker component that will let us make <StorePicker/>
 */
 var StorePicker = React.createClass({
    mixins: [History],

    goToStore : function(event) {
        // get data from the input
        event.preventDefault();  // prevent form from submitting data and reloading page

        var storeId = this.refs.storeId.value;
        this.history.pushState(null, 'store/'+storeId);
    },

    render : function(){
        /* this refers to the StorePicker object */
        return (
          <form className="store-selector" onSubmit={this.goToStore}>
            <h2>Please enter a store</h2>
            <input type="text" ref="storeId" defaultValue={helpers.getFunName()} required />
            <input type="Submit"/>
          </form>
        )
    }
 });


var NotFound = React.createClass({
    render: function() {
        return <h1>Not Found!</h1>
    }
})



/*
 * Routes  --  Routes are just React components when using React-Router.  
 */
var routes = (
    <Router history={createBrowserHistory()}>
      <Route path="/" component={StorePicker}></Route>
      <Route path="/store/:storeId" component={App}></Route>
      <Route path="*" component={NotFound}></Route>
    </Router>
)


 ReactDOM.render(routes, document.querySelector('#main'));


