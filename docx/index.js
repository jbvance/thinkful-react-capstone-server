
/******************************************************
THIS FILE IS NOT CURRENTLY USED. THE DOCXTEMPLATER
MODULE IS BEING USED IN ITS PLACE, BUT THIS FILE IS BEING
LEFT IN THE REPO IN CASE IT IS DETERMINED THAT THIS
MODULE SHOULD BE USED IN THE FUTURE.
******************************************************/

const createReport = require('docx-templates');
var fs = require('fs');
var path = require('path');
const uuidv4 = require('uuid/v4');

exports.makeDocx = (content) => {
    const data = content.body;    
        // initialize contingentAgents to an empty array to prevent an error
        // if there are no contingent Agents listed
        data['contingentAgents'] = [];

        // place contingent agents into a separate array for processing if present
        if (data.agents && data.agents.length > 1) {
            data['contingentAgents'] = data.agents.slice(1);
        }

        // Populate the .docx template
        // use uuidv4 to guarantee that a unique filename will be created.
        createReport({
            template: path.resolve(__dirname, 'dpoa.docx'),
            output: path.resolve(__dirname, 'output_docs', `${uuidv4()}.docx`),
            data
        });
    
}

exports.makeDocxTEST = (content) => {
    const data = {
        firstName: 'John',
        lastName: 'Doe',
        address: '1234 Main St.',
        city: 'Houston',
        state: 'TX',
        zip: '77002',
        agents: [
            {
                firstName: 'Mike',
                lastName: 'Smith',
                address: '9876 Jones St.',
                city: 'Tulsa',
                state: 'OK',
                zip: '74555'
            },
            {
                firstName: 'Jim',
                lastName: 'Jackson',
                address: '8179 W. 34th St.',
                city: 'Dallas',
                state: 'TX',
                zip: '99999'
            },
            {
                firstName: 'Whitt',
                lastName: 'Byron',
                address: '3400 Oak Forest St.',
                city: 'Houston',
                state: 'TX',
                zip: '77018'
            }
        ]
    };

    if (data.agents && data.agents.length > 1) {
        data['contingentAgents'] = data.agents.slice(1);
    }

    createReport({
        template: path.resolve(__dirname, 'dpoa.docx'),
        output: path.resolve(__dirname, 'output.docx'),
        data
    });
}
