import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';

declare let $: any;

@Component({
    selector: 'file-picker',
    templateUrl: './file-picker.component.html',
    styleUrls: ['./file-picker.component.scss']
})
export class FilePickerComponent implements OnInit
{

    @Input() image: any;
    @Input() editType: any = 'add';
    @Input() label;
    @Input() onlyImage = false;

    @ViewChild('fileInput', { static: true }) fileInput: ElementRef;

    @Output() onFileSelect: EventEmitter<any> = new EventEmitter;
    @Output() onDeleteFile: EventEmitter<any> = new EventEmitter;
    @Input() description: string;
    @Input() isIconHidden: boolean = false;
    @Input() type: string;
    @Input() size: { width: number, height: number } = { width: 100, height: 100 };
    @Input() controlName: string = 'image';
    isDeleteShown: boolean = false;
    @Input() imageFile:boolean=true
    @Input() docFile:boolean=false
	camera: String = "assets/images/sdn/camera.svg"

    constructor() 
    {
        this.image = '';
    }

    ngOnInit() 
    {

    }

    onHover(state: string): void
    {
        if (this.image)
        {
            if (state == 'over')
            {
                this.isDeleteShown = true;
            }
            else
            {
                this.isDeleteShown = false;
            }
        }

    }

    onDeleteImage(): void
    {
        if (this.editType == 'add')
        {
            this.image = '';
        }
        else
        {
            this.image = '';
            this.onDeleteFile.emit('this.imageId');
        }

        let dict = {
            valid: true,
            file: null,
            controlName: this.controlName
        }

        this.onFileSelect.emit(dict);
    }

    onFileChange(event)
    {
        let reader: any = new FileReader();
        if (event.target.files && event.target.files.length > 0)
        {
            let file = event.target.files[0];
            reader.readAsDataURL(file);
            reader.onload = (event: any) =>
            {
                var img: any = new Image();

                img.onload = () =>
                {
                    let dict = {
                        filename: file.name,
                        filetype: file.type,
                        value: reader.result.split(',')[1],
                        valid: false,
                        imagePreview: event.target.result,
                        file: file,
                        controlName: this.controlName
                    }

                    dict.valid = true;
                    this.onFileSelect.emit(dict);
                    this.image = event.target.result;
                };

                img.src = reader.result;
            };
        }
    }
}
