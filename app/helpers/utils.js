const ItemsModel      = require(__path_schemas + 'items');
let createFilterStatus = async (currentStatus) => {
    let statusFilter = [
        { name: 'All', value: "all", count: 1, class: 'btn btn-outline-primary' },
        { name: 'Active', value: "active", count: 2, class: 'btn btn-outline-primary' },
        { name: 'Inactive', value: "inactive", count: 3, class: 'btn btn-outline-primary' },
    ];
    
    
    for(let index = 0; index < statusFilter.length; index++){
        let item = statusFilter[index];
        let condition = (item.value != "all") ? {status: item.value} : {};
        if(item.value == currentStatus) statusFilter[index].class = 'btn btn-primary';
        await ItemsModel.countDocuments(condition).then((data) => {
            statusFilter[index].count = data;
        });
    }

    return statusFilter;
}

module.exports = {
    createFilterStatus: createFilterStatus,
}