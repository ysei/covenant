//@ sourceMappingURL=covenant.map
// Generated by CoffeeScript 1.6.1
(function() {
  var CompletedState, Core, Covenant, FulfilledState, PendingState, RejectedState, enqueue, root,
    _this = this,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = typeof exports !== "undefined" && exports !== null ? exports : this.Covenant;

  root.enqueue = enqueue = (typeof setImmediate === 'function' && setImmediate) || (typeof process !== "undefined" && process !== null ? process.nextTick : void 0) || function(task) {
    return setTimeout(task, 0);
  };

  root.Covenant = Covenant = (function() {

    function Covenant(then) {
      this.then = then != null ? then : function() {};
    }

    return Covenant;

  })();

  root.Core = Core = (function(_super) {

    __extends(Core, _super);

    function Core(resolver) {
      var _this = this;
      if (resolver == null) {
        resolver = function() {};
      }
      this._resolveNonCovenantValue = function(value) {
        return Core.prototype._resolveNonCovenantValue.apply(_this, arguments);
      };
      this.resolve = function(value) {
        return Core.prototype.resolve.apply(_this, arguments);
      };
      this.reject = function(reason) {
        return Core.prototype.reject.apply(_this, arguments);
      };
      this.fulfill = function(value) {
        return Core.prototype.fulfill.apply(_this, arguments);
      };
      this.then = function(onFulfill, onReject) {
        return Core.prototype.then.apply(_this, arguments);
      };
      if (!(this instanceof Covenant)) {
        return new Core(resolver);
      }
      if (typeof resolver !== 'function') {
        throw new TypeError("resolver must be a function");
      }
      this.state = new PendingState;
      try {
        resolver.call(this, this.resolve, this.reject, this);
      } catch (e) {
        this.reject(e);
      }
    }

    Core.prototype.then = function(onFulfill, onReject) {
      var _this = this;
      return new this.constructor(function(resolve, reject) {
        return _this.state.applyThen(onFulfill, onReject, resolve, reject);
      });
    };

    Core.prototype.fulfill = function(value) {
      return this.state = this.state.fulfill(value);
    };

    Core.prototype.reject = function(reason) {
      return this.state = this.state.reject(reason);
    };

    Core.prototype.resolve = function(value) {
      if (value instanceof Covenant) {
        return value.then(this.fulfill, this.reject);
      } else {
        return this._resolveNonCovenantValue(value);
      }
    };

    Core.prototype._resolveNonCovenantValue = function(value) {
      var once, valueThen;
      try {
        valueThen = value != null ? value.then : void 0;
        if (value !== Object(value) || typeof valueThen !== 'function') {
          return this.fulfill(value);
        } else {
          once = (function(done) {
            return function(f) {
              return function(x) {
                if (!done) {
                  done = true;
                  return f(x);
                }
              };
            };
          })(false);
          try {
            return valueThen.call(value, once(this.resolve), once(this.reject));
          } catch (e) {
            return once(this.reject)(e);
          }
        }
      } catch (e) {
        return this.reject(e);
      }
    };

    Core.prototype.promise = function() {
      return new Covenant(this.then);
    };

    return Core;

  })(Covenant);

  PendingState = (function() {

    function PendingState() {
      this.pendeds = [];
    }

    PendingState.prototype.fulfill = function(value) {
      return new FulfilledState(value, this.pendeds);
    };

    PendingState.prototype.reject = function(reason) {
      return new RejectedState(reason, this.pendeds);
    };

    PendingState.prototype.applyThen = function(onFulfilled, onRejected, resolve, reject) {
      return this.pendeds.push(function(state) {
        return state.then(onFulfilled, onRejected).then(resolve, reject);
      });
    };

    return PendingState;

  })();

  CompletedState = (function() {

    function CompletedState(pendeds) {
      var _this = this;
      if (pendeds == null) {
        pendeds = [];
      }
      enqueue(function() {
        var pended, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = pendeds.length; _i < _len; _i++) {
          pended = pendeds[_i];
          _results.push(pended(_this));
        }
        return _results;
      });
    }

    CompletedState.prototype.fulfill = function() {
      return this;
    };

    CompletedState.prototype.reject = function() {
      return this;
    };

    CompletedState.prototype.then = function(valueOrReason, onFulfilledOrRejected) {
      try {
        if (typeof onFulfilledOrRejected !== 'function') {
          return this;
        } else {
          return new FulfilledState(onFulfilledOrRejected(valueOrReason));
        }
      } catch (e) {
        return new RejectedState(e);
      }
    };

    CompletedState.prototype.applyThen = function(onFulfilled, onRejected, resolve, reject) {
      var _this = this;
      return enqueue(function() {
        return _this.then(onFulfilled, onRejected).then(resolve, reject);
      });
    };

    return CompletedState;

  })();

  FulfilledState = (function(_super) {

    __extends(FulfilledState, _super);

    function FulfilledState(value, pended) {
      this.value = value;
      FulfilledState.__super__.constructor.call(this, pended);
    }

    FulfilledState.prototype.then = function(onFulfill, onReject) {
      return FulfilledState.__super__.then.call(this, this.value, onFulfill);
    };

    return FulfilledState;

  })(CompletedState);

  RejectedState = (function(_super) {

    __extends(RejectedState, _super);

    function RejectedState(reason, pended) {
      this.reason = reason;
      RejectedState.__super__.constructor.call(this, pended);
    }

    RejectedState.prototype.then = function(onFulfill, onReject) {
      return RejectedState.__super__.then.call(this, this.reason, onReject);
    };

    return RejectedState;

  })(CompletedState);

}).call(this);