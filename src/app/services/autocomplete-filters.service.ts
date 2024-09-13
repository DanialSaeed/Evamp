import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AutocompleteFiltersService
{


  constructor() { }

  _filterNationality(value: any, nationalities: any): any[]
  {

    let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return nationalities.filter(option => option.nationality.toLowerCase().includes(filterValue));

  }

  _filterReligion(value: any, religions: any): any[]
  {

    let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return religions.filter(option => option.religion.toLowerCase().includes(filterValue));

  }

  _filterEthinicOrigin(value: any, ethinicOrigin: any): any[]
  {

    let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return ethinicOrigin.filter(option => option.origin.toLowerCase().includes(filterValue));

  }

  _filterLanguage(value: any, languages: any): any[]
  {

    let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return languages.filter(option => option.language.toLowerCase().includes(filterValue));

  }

  _filterBranches(value: any, branches: any): any[]
  {

    let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return branches.filter(option => option.label.toLowerCase().includes(filterValue));

  }

  _filterRooms(value: any, rooms: any): any[]
  {

    let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return rooms.filter(option => option.label.toLowerCase().includes(filterValue));

  }

  _filterStaff(value: any, staffs: any): any[]
  {

    let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return staffs.filter(option => option.name.toLowerCase().includes(filterValue));

  }
  _filterGuardians(value: any, guardians: any): any[]
  {
    let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return guardians.filter(option => (option.name != '' && option.name != null ? option.name : '').toLowerCase().includes(filterValue));

  }

  _filterChildrens(value: any, childrens: any): any[]
  {
     let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return childrens.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  _filterUnlinkedChildrens(value: any, childrens: any): any[]
  {
     let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return childrens.filter(option => option.data.name.toLowerCase().includes(filterValue));
  }

  _filterAdditionalItems(value: any, items: any): any[]
  {
     let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return items.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  _filterRelationships(value: any, relations: any): any[]
  {
     let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return relations.filter(option => option.label.toLowerCase().includes(filterValue));
  }

  _filterGuardianRelations(value: any, relations: any): any[]
  {
     let filterValue = typeof (value) == 'string' ? value.toLowerCase() : '';
    return relations.filter(option => option.relationType.toLowerCase().includes(filterValue));
  }

  
}
