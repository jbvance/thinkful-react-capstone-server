const JSZip = require('jszip');
const Docxtemplater = require('docxtemplater');
const uuidv4 = require('uuid/v4');
const uploadToS3 = require('./uploadToS3');

const fs = require('fs');
const path = require('path');

//Load the docx file as a binary
module.exports = {
    saveDoc: (bodyContent => {
        //console.log("BODY CONTENT IN SAVEDOC", bodyContent)
        const data = bodyContent;  
        const outputFileName = `${data.userId}__${uuidv4()}.docx`      
        const content = fs
            .readFileSync(path.resolve(__dirname, 'dpoa-1.docx'), 'binary');

        var zip = new JSZip(content);       

        var doc = new Docxtemplater();
        doc.loadZip(zip).setOptions({ paragraphLoop: true });
                
        data['primaryAgent'] = data.agents[0]
        // place contingent agents into a separate array for processing if present
        data['contingentAgents'] = data.agents && data.agents.length > 1 ? data.agents.slice(1) : [];    
        data['hasContingentAgents'] = data['contingentAgents'].length > 0;

        //Load data into template
        doc.setData(data);

        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        }
        catch (error) {
            const e = {
                message: error.message,
                name: error.name,
                stack: error.stack,
                properties: error.properties,
            }
            console.log(JSON.stringify({ error: e }));
            // The error thrown here contains additional information when logged with JSON.stringify (it contains a property object).
            throw error;
        }

        const buf = doc.getZip()
            .generate({ type: 'nodebuffer' });

        // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
        //fs.writeFileSync(path.resolve(__dirname, 'output_docs', `${uuidv4()}.docx`), buf);       
        
        uploadToS3.uploadFromBuffer(buf, outputFileName);        
       
        return {
            message: "Document successfully created",
            filename: outputFileName        
        };

    }),
   
}
