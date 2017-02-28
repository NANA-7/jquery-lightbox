;(function($){
	var LightBox = function(settings){
		var self = this;

		// 参数
		this.settings = {
			speed: 500
		};

		$.extend(this.settings, settings || {});

		// 创建遮罩层和弹出框
		this.popupMask = $('<div id="lb-mask">');
		this.popupWin = $('<div id="lb-popup">');

		// 选择body
		this.body = $(document.body);

		// 渲染剩余的DOM，插入body
		this.renderDOM();

		// 获取数据容器
		this.picViewArea = this.popupWin.find(".lb-pic-view"); //图片展示区
		this.popupPic = this.popupWin.find('.lb-img'); //图片
		this.picCaptionArea = this.popupWin.find('.lb-pic-caption'); //图片描述区
		this.nextBtn = this.popupWin.find('.lb-next-btn');
		this.prevBtn = this.popupWin.find('.lb-prev-btn');
		this.captionTxt = this.popupWin.find('.lb-pic-desc'); //描述文字
		this.currentIndex = this.popupWin.find('.lb-of-index'); //索引
		this.closeBtn = this.popupWin.find('.lb-close-btn'); //关闭按钮

		// 获取组数据

		// 获取组别
		this.groupName = null;
		// 定义数据存储的数组
		this.groupData = [];
		this.body.on('click','js-lightbox,*[data-role=lightbox]',function(e){
			e.stopPropagation(); //阻止冒泡事件

			// 获取组名
			var currentGroupName = $(this).attr('data-group');

			// 判断是否获取同一组数据，防止重复获取
			if (currentGroupName != self.groupName) {
				self.groupName = currentGroupName;

				// 根据当前组名获取同一组数据
				self.getGroup();
			}
			// 初始化弹框
			self.initPopup($(this));
		});
		// 关闭弹窗
		this.popupMask.click(function(){
			$(this).fadeOut();
			self.popupWin.fadeOut();
			this.clear = false;
		});
		this.closeBtn.click(function(){
			self.popupMask.fadeOut();
			self.popupWin.fadeOut();
			this.clear = false;
		});
		// 左右切换按钮事件
		this.flag = true; //定义标示，防止点击过快造成的BUG
		this.prevBtn.hover(function(){
			if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
				$(this).addClass('lb-prev-btn-show');
			}
		},function(){
			if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
				$(this).removeClass('lb-prev-btn-show');
			}
		}).click(function(e){
			if (!$(this).hasClass('disabled') && self.flag) {
				self.flag = false;
				e.stopPropagation();
				self.goto("prev");
			}
		});
		this.nextBtn.hover(function(){
			if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
				$(this).addClass('lb-next-btn-show');
			}
		},function(){
			if (!$(this).hasClass('disabled') && self.groupData.length > 1) {
				$(this).removeClass('lb-next-btn-show');
			}
		}).click(function(e){
			if (!$(this).hasClass('disabled') && self.flag) {
				self.flag = false;
				e.stopPropagation();
				self.goto("next");
			}
		});
		// 改变窗口事件
		var timer = null; //定时器，防止函数阻塞
		this.clear = false;
		$(window).resize(function(){
			if (self.clear) {
				window.clearTimeout(timer);
				timer = window.setTimeout(function(){
					self.loadPic(self.groupData[self.index].src);
				},500);
			}
		}).keyup(function(e){
			// 键盘事件
			var keyVal = e.which;
			if (self.clear) {
				if (keyVal == 38 || keyVal == 37) {
					self.prevBtn.click();
				}
				if (keyVal == 39 || keyVal == 40) {
					self.nextBtn.click();
				}
			}
		});
	};
	LightBox.prototype = {
		goto: function(dir){
			if (dir === "next") {
				this.index ++;
				if (this.index >= this.groupData.length - 1) {
					this.nextBtn.addClass('disabled').removeClass('lb-next-btn-show');
				}
				if (this.index != 0) {
					this.prevBtn.removeClass('disabled');
				}
				var src = this.groupData[this.index].src;
				this.loadPic(src);
			}else if (dir = "prev") {
				this.index --;
				if (this.index <= 0) {
					this.prevBtn.addClass('disabled').removeClass('lb-prev-btn-show');
				}
				if (this.index != this.groupData.length - 1) {
					this.nextBtn.removeClass('disabled');
				}
				var src = this.groupData[this.index].src;
				this.loadPic(src);
			}
		},
		show: function(sourceSrc, currentId){
			var self = this;
			
			this.popupPic.hide();
			this.picCaptionArea.hide();
			// 显示弹框及动画
			this.popupMask.fadeIn();

			var winW = $(window).width() > self.settings.maxWidth ? self.settings.maxWidth : $(window).width();
			var winH = $(window).height() > self.settings.maxHeight ? self.settings.maxHeight : $(window).height();
			this.picViewArea.css({
				width: winW/2 + 'px',
				height: winH/2 + 'px'
			});
			this.popupWin.fadeIn();
			var viewH = $(window).height()/2 + 10;
			this.popupWin.css({
				width: winW/2 + 10 + 'px',
				height: winH/2 +10 + 'px',
				marginLeft: -(winW/2 +10)/2 + 'px',
				top: -viewH + 'px'
			}).animate({
				top: ($(window).height()-viewH)/2 + 'px'
			},self.settings.speed,function(){
				//动画完后回调里加载图片
				self.loadPic(sourceSrc);
			});
			// 根据当前元素ID获取当前组别的索引
			this.index = this.getIndex(currentId);

			// 左右切换按钮
			var groupDataLen = this.groupData.length;
				// 判断图片是否大于1
			if (groupDataLen > 1) {
				if (this.index === 0) {
					// 点击第一张时，隐藏左按钮
					this.prevBtn.addClass('disabled');
					this.nextBtn.removeClass('disabled');
				}else if (this.index === groupDataLen-1) {
					// 点击最后一张时，隐藏右按钮
					this.nextBtn.addClass('disabled');
					this.prevBtn.removeClass('disabled');
				}else{
					this.prevBtn.removeClass('disabled');
					this.nextBtn.removeClass('disabled');
				}
			}
		},
		loadPic: function(sourceSrc){
			var self = this;
			self.popupPic.css({
				width: 'auto',
				height: 'auto'
			}).hide();
			self.picCaptionArea.hide();
			// 加载图片
			this.preLoadPic(sourceSrc, function(){
				// 图片放入容器
				self.popupPic.attr('src',sourceSrc);

				var picW = self.popupPic.width();
				var picH = self.popupPic.height();
				// 改变图片宽高
				self.changePic(picW, picH);
			});
		},
		preLoadPic: function(src, callback){
			var img = new Image();

			if (!!window.ActiveXObject) {
				img.onreadystatechange = function(){
					if (this.readystate == 'complete') {
						callback();
					}
				}
			}else{
				img.onload = function(){
					callback();
				}
			}
			img.src = src;
		},
		changePic: function(picW, picH){
			var self = this;
			var winW = $(window).width() > self.settings.maxWidth ? self.settings.maxWidth : $(window).width();
			var winH = $(window).height() > self.settings.maxHeight ? self.settings.maxHeight : $(window).height();

			// 根据当前浏览器视口缩放图片比例
			var scale = Math.min(winW/(picW + 10),winH/(picH + 10),1);
			picW = picW * scale;
			picH = picH * scale;

			self.picViewArea.animate({
				width: picW - 10 + 'px',
				height: picH - 10 + 'px'
			},self.settings.speed);
			self.popupWin.animate({
				width: picW + 'px',
				height: picH + 'px',
				marginLeft: -picW/2 + 'px',
				top: ($(window).height()-picH)/2 + 'px'
			},self.settings.speed,function(){
				self.popupPic.css({
					width: picW -10,
					height: picH - 10
				}).fadeIn();
				self.picCaptionArea.fadeIn();
				self.flag = true;
				self.clear = true;
			});
			// 设置描述文字和当前索引
			this.captionTxt.text(this.groupData[this.index].caption);
			this.currentIndex.text(`${this.index + 1}/${this.groupData.length}`);
		},
		getIndex: function(currentId){
			// 获取数组里的索引
			var index = 0;
			$(this.groupData).each(function(i){
				index = i;
				if (this.id === currentId) {
					return false;
				}
			});
			return index;
		},
		initPopup: function(oCurrent){
			var self = this,
					sourceSrc = oCurrent.attr('data-source'),
					currentId = oCurrent.attr('data-id');

			this.show(sourceSrc, currentId);
		},
		getGroup: function(){
			var self = this;
			// 根据当前组名获取页面中所有相同组别的数据
			var groupList = this.body.find('*[data-group=' + this.groupName + ']');
			// 清空数组
			self.groupData = [];
			// 获取数据存入groupData
			groupList.each(function(){
				self.groupData.push({
					src: $(this).attr('data-source'),
					id: $(this).attr('data-id'),
					caption: $(this).attr('data-caption')
				});
			});
		},
		renderDOM: function(){
			var sDOM = "";
					sDOM += '<div class="lb-pic-view">';
					sDOM += '<i class="lb-btn lb-prev-btn"></i>';
					sDOM += '<img class="lb-img">';
					sDOM += '<i class="lb-btn lb-next-btn"></i>';
					sDOM += '</div>';
					sDOM += '<div class="lb-pic-caption">';
					sDOM += '<div class="lb-caption-area">';
					sDOM += '<p class="lb-pic-desc"></p>';
					sDOM += '<span class="lb-of-index">0 of 0</span>';
					sDOM += '</div>';
					sDOM += '<i class="lb-close-btn"></i>';
					sDOM += '</div>';
			// 插入到popupWin
			this.popupWin.html(sDOM);
			// 插入到body
			this.body.append(this.popupMask,this.popupWin);
		
		}
	};
	// 挂载到window
	window.LightBox= LightBox;
})($);