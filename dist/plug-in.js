/**
 * @author ooxx
 * @desc pagination plug-in
 */

;(function(global, doc, undefined) {

	// avoid mutiple load natsu
	if (global.natsu)
		return ;

	var natsuVer = '0.1';

	// log
	var log = function() {
		console.log(arguments);
	}

	// pagination html
	var PAGINATION_HTML =   '<div class="ooxx-pagination-wrp">' +
						    	'<button class="prev-btn">prev</button>' +
								'<span class="cur-page">{{cur-page}}</span>' +
								'<span class="gap">{{gap}}</span>' +
								'<span class="total-pages">{{total-pages}}</span>' +
								'<button class="next-btn">next</button>' +
							'</div>';

	// disabled css class
	var DISABLE_CLICK_CSS_CLASS = 'disable-click';
	// disabled attr
	var DISABLED = 'disabled';

	// replace cur-page gap and total-pages
	var replaceSomeElements = function(opts) {
		opts = opts || { };
		return PAGINATION_HTML.replace('{{cur-page}}', opts.curPage || 1 ).replace('{{gap}}', opts.gap || '/').replace('{{total-pages}}', opts.totalPages || 1)
	}

	// basic id
	var curId = -1;

	// generate id
	var genId = function() {
		return ++ curId;
	}

	// part of default options
	var defaultOpts = {
		successCb: log.bind(null, 'success'),
		errorCb: log.bind(null, 'fail'),
	}

	// plug-in define
	var natsu = global.natsu = function(opts) {
		this.id = genId();
		// dom-wrapper id
		this.containerId = opts.containerId;
		// success callback
		this.successCb = opts.successCb || defaultOpts.successCb;
		// error callback
		this.errorCb = opts.errorCb || defaultOpts.errorCb;
		// paging options
		this.pagingOpts = {
			curPage: opts.current || 1,
			totalPages: opts.totalPages || 1
		}
	}

	// proto object
	var proto = natsu.prototype;

	// serialization
	proto.natsu = function() {
		return this.init().refreshDisabledElements().bindEvts();
	}

	// initialize
	proto.init = function() {
		var _this = this;

		if (! this.containerId) {
			this.errorCb('no container id');

			return null;
		}

		// some cache of dom
		// wrp
		var domWrp = this.domWrp = doc.getElementById(this.containerId);
		// render first
		proto.render.call(this);
		// pluginWrp
		var pluginWrp = this.pluginWrp = domWrp.getElementsByClassName('ooxx-pagination-wrp')[0];
		// prev-btn
		this.domPrev = pluginWrp.getElementsByClassName('prev-btn')[0];
		// next-btn
		this.domNext = pluginWrp.getElementsByClassName('next-btn')[0];
		// cur-page
		this.domCurPage = pluginWrp.getElementsByClassName('cur-page')[0];
		// total-page
		this.domTotalPages = pluginWrp.getElementsByClassName('total-pages')[0];

		return this;
	}

	// render ooxx html
	proto.render = function() {
		// user should confirm safety of the opration(must use after init successfully)
		this.domWrp.innerHTML = replaceSomeElements({
			curPage: this.pagingOpts.curPage,
			totalPages: this.pagingOpts.totalPages,
			gap: '/'
		});

		return this;
	}

	// re-render some element(curPage || totalPages)
	proto.reRenderPages = function() {
		this.domCurPage.innerText = this.pagingOpts.curPage;
		this.domTotalPages.innerText = this.pagingOpts.totalPages;

		return this;
	}

	// refresh ooxx
	proto.refresh = function(opts) {
		opts = opts || { };
		// if need to re-assign
		if (opts.reAssign) {
			// dom-wrapper id
			this.containerId = opts.containerId;
			// success callback
			this.successCb = opts.successCb || defaultOpts.successCb;
			// error callback
			this.errorCb = opts.errorCb || defaultOpts.errorCb;
			// paging options
			this.pagingOpts = {
				curPage: opts.current || 1,
				totalPages: opts.totalPages || 1
			}
		}

		// after re-assign, internal cache may be need to reset
		if (opts.reInit)
			this.init();

		// re-render pages without config
		this.reRenderPages();

		return this;
	}

	// add disabled
	proto.refreshDisabledElements = function() {
		// must be called after dom is ready or even re-init
		this.oprDisabled('prev-btn', this.pagingOpts.curPage === 1);
		this.oprDisabled('next-btn', this.pagingOpts.totalPages === 1 || this.pagingOpts.curPage === this.pagingOpts.totalPages);

		return this;
	}

	// add disabled
	// flag => false  =====> isAdd
	proto.oprDisabled = function(type, flag) {
		var isRemove = flag === false;
		switch(type) {
			case 'prev-btn':
				if (! isRemove) {
					this.domPrev.setAttribute(DISABLED, DISABLED);
					this.domPrev.classList.add(DISABLE_CLICK_CSS_CLASS);
				}
				else {
					this.domPrev.removeAttribute(DISABLED);
					this.domPrev.classList.remove(DISABLE_CLICK_CSS_CLASS);
				}
				break;
			case 'next-btn':
				if (! isRemove) {
					this.domNext.setAttribute(DISABLED, DISABLED);
					this.domNext.classList.add(DISABLE_CLICK_CSS_CLASS);
				}
				else {
					this.domNext.removeAttribute(DISABLED);
					this.domNext.classList.remove(DISABLE_CLICK_CSS_CLASS);
				}
				break;
			default:
				break;
		}

		return this;
	}

	// go to certain page
	proto.goto = function(page) {
		if (page !== +page) {
			this.errorCb('invalid page number');
			return null;
		}
		page = +page;
		if (page < 1 ||
			page > this.pagingOpts.totalPages) {

			this.errorCb('page number is out of range');
			return null;
		}
		// re-assign pagingOpts.curPage
		this.pagingOpts.curPage = page;
		// invoke successCb
		this.successCb(page);
		// refresh status
		this.refreshDisabledElements().refresh();

		return this;
	}

	// prev page
	proto.prev = function() {
		this.goto(this.pagingOpts.curPage - 1);

		return this;
	}

	// next page
	proto.next = function() {
		this.goto(this.pagingOpts.curPage + 1);

		return this;
	}

	// bind some evts
	proto.bindEvts = function() {
		var _this = this;
		this.domPrev.addEventListener('click', function() {
			proto.prev.call(_this);
		});
		this.domNext.addEventListener('click', function() {
			proto.next.call(_this);
		});

		return this;
	}

	// global cache, use closure, { id: INT, name: STRING }
	var data = natsu.data = { };

	// save one instance info to ooxxs
	var saveInstanceInfo = function(info) {
		data[info.id] = info.name;
		return data;
	}

	// delete one instance info by id
	// if param is right ======> return ooxxs
	// else              ======> return null
	var deleteInstanceInfo = function(id) {
		var _id = +id;
		if (id !== _id) {
			console.log('cannot transfer ' + id + ' to a number');
			return null;
		}
		delete data[_id];
		return data;
	}

})(window, document)
