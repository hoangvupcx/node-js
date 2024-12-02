var express           = require('express');
var router            = express.Router();

const util            = require('util');

const systemConfig    = require(__path_configs + 'system');
const notify          = require(__path_configs + 'notify');
const ItemsModel      = require(__path_schemas + 'items');
const UtilsHelpers    = require(__path_helpers + 'utils');
const ParamsHelpers   = require(__path_helpers + 'params');
const ValidateItems   = require(__path_validates + 'items');

const linkIndex       = `/${systemConfig.prefixAdmin}/items/`;
const pageTitile      = 'Item Management';
const pageTitileAdd   = pageTitile + ' - Add Item';
const pageTitileEdit  = pageTitile + ' - Edit Item';
const folderView      = __path_views + 'pages/items/';

/* GET items page. */
router.get('(/status/:status)?', async (req, res, next) => {
  let objWhere      = {};
  let keyword       = ParamsHelpers.getParams(req.query, 'keyword', '');
  let currentStatus = ParamsHelpers.getParams(req.params, 'status', 'all');
  let statusFilter  = await UtilsHelpers.createFilterStatus(currentStatus);
  let pagination    = {
    totalItems            : 1,
    totalItemsPerPage     : 3,
    currentPage           : parseInt(ParamsHelpers.getParams(req.query, 'page', 1)),
    pageRanges            : 5,

  };

  if(currentStatus !== 'all') objWhere.status = currentStatus;
  if(keyword !== '') objWhere.name = new RegExp(keyword, 'i');

  await ItemsModel.countDocuments(objWhere).then( (data) => {
		pagination.totalItems = data;
	});

  ItemsModel
		.find(objWhere)
    .sort({ordering: 'asc'})
    .skip((pagination.currentPage - 1) * pagination.totalItemsPerPage)
    .limit(pagination.totalItemsPerPage)
		.then( (items) => {
			res.render(folderView +  'list', { 
				title: pageTitile,
				items,
        statusFilter,
        currentStatus,
        keyword,
        pagination,
			});
		});
});

// FORM
router.get('(/form(/:id)?)', (req, res, next) => {
  let id = ParamsHelpers.getParams(req.params, 'id', '');
  let item = {
    name: '',
    status: 'default',
    ordering: 0
  };

  let errors = null;
  if(id === ''){
    res.render(folderView +  'form', { title: pageTitileAdd, item, errors });
  } else {
    ItemsModel.findById(id).then((item) => {
      res.render(folderView +  'form', { title: pageTitileEdit, item, errors });
    })
    
  }
  
});

// Change Status - One
router.get('/change-status/:id/:status', (req, res, next) => {
  let currentStatus = ParamsHelpers.getParams(req.params, 'status', 'active');
  let id            = ParamsHelpers.getParams(req.params, 'id', '');
  let status        = (currentStatus === 'active') ? 'inactive' : 'active';

  ItemsModel.findById(id).then((itemResult) => {
    itemResult.status = status;
    itemResult.save().then((result) => {
      req.flash('success', notify.CHANGE_STATUS_SUCCESS, false);
      res.redirect(linkIndex);
    });
  });
});

// Delete - One
router.get('/delete/:id/', (req, res, next) => {
  let id            = ParamsHelpers.getParams(req.params, 'id', '');

  ItemsModel.findByIdAndDelete(id).then((err, result) => {
    req.flash('success', 'Deleted Successfully!', false);
    res.redirect(linkIndex);
  });
});

// Change Status - Multi
router.post('/change-status/:status', (req, res, next) => {
  let currentStatus = ParamsHelpers.getParams(req.params, 'status', 'active');

  ItemsModel.updateMany({_id: {$in: req.body.cid}}, {status: currentStatus}).then((result) => {
    req.flash('success', util.format(notify.CHANGE_STATUS_MULTI_SUCCESS, result.matchedCount), false);
    res.redirect(linkIndex);
    });
});

// Delete - Multi
router.post('/delete/', (req, res, next) => {
  ItemsModel.deleteMany({_id: {$in: req.body.cid}}).then((result) => {
    req.flash('success', `Deleted ${result.matchedCount} item(s) Successfully!`, false);
    res.redirect(linkIndex);
    });
});

// Change Ordering - Multi
router.post('/change-ordering/', (req, res, next) => {
  let cids      = req.body.cid;
  let orderings = req.body.ordering;
  console.log(cids);
  console.log(orderings);
  if(Array.isArray(cids)){
    cids.forEach((item, index) => {
      ItemsModel.updateOne({_id: item}, {ordering: parseInt(orderings[index])}).then((result) => {
       
      });
    })
  }else {
    ItemsModel.updateOne({_id: cids}, {ordering: parseInt(orderings)}).then((result) => {
    });
  }
  
  req.flash('success', 'Changed Ordering Successfully!', false);
  res.redirect(linkIndex);
});

// Add Item
router.post('/save/', (req, res, next) => {
  req.body = JSON.parse(JSON.stringify(req.body));
  ValidateItems.validator(req);

  let errors = req.validationErrors();
  let item = Object.assign(req.body);

  console.log(item);

  if(typeof item !== "undefined" && item.id !== "" ){	
    console.log('Edit');
    if(errors !== false){
      res.render(folderView +  'form', { 
        title: pageTitileEdit,
        item,
        errors,
      });
    } else {
      ItemsModel.updateOne({_id: item.id}, {
        ordering: parseInt(item.ordering),
        name: item.name,
        status: item.status,
      }).then(() => {
        req.flash('success', 'Updated Successfully!', false);
        res.redirect(linkIndex);
      });
    }
  } else {
    console.log('Add');
    if(errors){
      res.render(folderView +  'form', { 
        title: pageTitileAdd,
        item,
        errors,
      });
    } else {
      new ItemsModel(item).save().then(() => {
        req.flash('success', 'Added Successfully!', false);
        res.redirect(linkIndex);
      });
    }
  }
  
  
});
module.exports = router;
