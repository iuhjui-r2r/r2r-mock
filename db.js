
module.exports = {
	index : 10,
	data : [
		{ id:0, name:"全部文件", type:"folder", parent_id:-1 },
		{ id:1, name:"压缩包.zip", type:"zip", parent_id:0 },
		{ id:2, name:"样式文件.css", type:"css", parent_id:0 },
		{ id:3, name:"脚本文件.js", type:"js", parent_id:0 },
		{ id:4, name:"设计稿.psd", type:"psd", parent_id:0 },
	],
	generateID:function(){
		this.index=this.index+1;
		var last =this.index
		return last;
	},
	find:function(id){
		var target = null;
		this.data.forEach(function(el,i){
			if (el.id == id){
				target = el;
				return false
			}
		});
		if (target){
			return {err:null,data:target}
		}else{
			return {err:"文件不存在",data:null}
		}
	},
	findChild:function(parent_id){
		let parent = this.find(parent_id).data
		if (!parent){
			return {err:"父节点不存在",data:null}
		}
		if ( parent.type != "folder" ){
			return {err:"父节点不是目录",data:null}
		}
		
		var arr = this.data.filter(function(el,i){
			return el.parent_id == parent_id
		});
		return {err:null,data:arr};
	},
	findPath:function(parent_id){
		var path = [];
		while(true){
			var result = this.find(parent_id)
			if (result.err){
				return result
			}
			if (result.data.type != "folder"){
				return {err:"路径节点不是目录",data:null}
			}
			var node = result.data
			path.unshift(node)
			parent_id = node.parent_id
			if (node.parent_id == -1 ){
				break
			}
		}
		return {err:null,data:path}
	},
	findTree:function(id){
		var result = this.find(id);
		if ( result.err  ){
			return result
		}		
		if ( result.data.type != "folder" ){
			return {err:"文件必须是目录",data:null}
		}
		
		var file   = result.data
		var self   = this
		var childs = this.findChild(file.id).data;
		var list   = []
		childs.forEach(function(el){
			if ( el.type == "folder" ){
				var node = self.findTree(el.id).data
				list.push(node)
			}	
		});
		
		var node = {
			id   : file.id,
			name : file.name,
			list : list
		};
		return {err:null,data:node}
	},
	lookup:function(parent_id,name){
		var result = this.findChild(parent_id)
		if (result.err){
			return result
		}
		
		var target;
		result.data.forEach(function(el,i){
			if (el.name == name){
				target = el;
				return false
			}
		});
		return {err:null,data:target};
	},
	create:function(parent_id,name,type){
		var result = this.lookup(parent_id,name)
		if (result.err){
			return result
		}		
		if (result.data){
			return {err:"文件名重复",data:null}
		}
		
		let file = {
			id        : this.generateID(),
			name      : name,
			type      : type,
			parent_id : parent_id,
		}
		this.data.push(file)
		return {err:null,data:file}
	},
	mkdir:function(parent_id,name){
		return this.create(parent_id,name,"folder");
	},
	rename:function(parent_id,source,target){
		var r1 = this.lookup(parent_id,source)
		if (r1.err){
			return r1;
		}
		if (!r1.data){
			return {err:"文件不存在",data:""}
		}
		var r2 = this.lookup(parent_id,target)
		if (r2.err){
			return r2;
		}
		if (r2.data){
			return {err:"文件名重复",data:""}
		}
		
		r1.data.name = target
		
		return {err:null,data:r1.data}
	},
	removeFile:function(file){
		var data = []
		this.data.forEach(function(el){
			if( el.id != file.id ){
				data.push(el);
			}
		});
		this.data = data
	},
	removeFolder:function(folder){
		var childs = this.findChild(folder.id).data;
		var self = this
		childs.forEach(function(el){
			if ( el.type == "folder" ){
				self.removeFolder(el);
			}else{
				self.removeFile(el);
			}
		});
		this.removeFile(folder);
	},
	remove:function(id){
		var r1 = this.find(id)
		if (r1.err){
			return r1
		}
		var file = r1.data;
		
		if ( file.type == "folder" ){
			this.removeFolder(file);
		}else{
			this.removeFile(file);
		}
		return {err:null,data:null}
	},
	move:function(source_id,target_id){
		var r1 = this.find(source_id);
		if (r1.err){
			return r1
		}
		var r2 = this.find(target_id);
		if (r2.err){
			return r2
		}
		if (r2.data.type != "folder"){
			return {err:"目标必须是目录",data:null}
		}
		
		var source = r1.data;
		var target = r2.data;
		
		if ( source.id == target.id ){
			return {err:"不能移动到自身",data:null}
		}
		if ( source.parent_id == target.id ){
			return {err:"已经在目标目录当中",data:null}
		}
		
		source.parent_id = target.id;
		return {err:null,data:null}
	},
	copyFile:function(file){
		var n = {
			id        : this.generateID(),
			name      : file.name,
			type      : file.type,
			parent_id : -1
		}
		if (n.type != "folder" ){
			return n;
		}
		var self   = this
		var childs = this.findChild(file.id).data;
		childs.forEach(function(el){
			var nf = self.copyFile(el)
			nf.parent_id = n.id
			self.data.push(nf);
		});
		return n;
	},
	copy:function(source_id,target_id){
		var r1 = this.find(source_id);
		if (r1.err){
			return r1
		}
		var r2 = this.find(target_id);
		if (r2.err){
			return r2
		}
		if (r2.data.type != "folder"){
			return {err:"目标必须是目录",data:null}
		}
		
		var source = r1.data;
		var target = r2.data;
		
		if ( source.id == target.id ){
			return {err:"不能复制到自身",data:null}
		}
		
		var file = this.copyFile(source);
		
		if (this.lookup(target.id,file.name).data){
			file.name = file.name+"-副本";	
		}
		file.parent_id = target.id;
		this.data.push(file);
		return {err:null,data:null}
	},
	
	
	
}
