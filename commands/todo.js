exports.run = async (client, msg, params = []) => {
	const todoMsg = (await client.channels.get(client.conf.todoChannel)
		.fetchMessages({ around: client.conf.todoMessage, limit: 1 }))
		.filter(message => message.id === client.conf.todoMessage).first();
	const fields = todoMsg.embeds[0].fields;
	if (!params[0]) {
		params[0] = 'lazyness';
	}
	if (!isNaN(params[0])) {
		if (!fields[parseInt(params[0]) - 1]) {
			msg.edit(`Eintrag wurde nicht gefunden.`);
		} else {
			msg.edit(`Eintrag \`${params[0]}\`:`, {
				embed: new client.methods.Embed().setColor('RANDOM')
					.addField(fields[parseInt(params[0]) - 1].name, fields[parseInt(params[0]) - 1].value)
			});
		}
	} else if (params[0] === 'edit') {
		if (!isNaN(params[1]) && fields[parseInt(params[1]) - 1] && params[2]) {
			fields[parseInt(params[1]) - 1].value = params.slice(2).join(' ');
			const embed = new client.methods.Embed();
			embed.setColor('RANDOM').setTitle('To-do-list').setDescription('\u200b');
			for (const field of fields) embed.addField(field.name, field.value);
			todoMsg.edit({ embed });
			msg.edit(`Bearbeitet: ${fields[parseInt(params[1]) - 1].name}`);
		}
	} else if (params[0] === 'add') {
		if (params[1] && params.slice(1).join(' ').split('|')[1]) {
			fields.push({ name: params.slice(1).join(' ').split('|')[0], value: params.slice(1).join(' ').split('|')[1] });
			const embed = new client.methods.Embed();
			embed.setColor('RANDOM').setTitle('To-do-list').setDescription('\u200b')
				.setFooter('\u200b');
			for (const field of fields) embed.addField(field.name, field.value);
			todoMsg.edit({ embed });
			msg.edit(`Eintrag Nummer \`${fields.length}\` hinzugefügt.`, {
				embed: new client.methods.Embed().setColor('RANDOM')
					.addField(fields[fields.length - 1].name, fields[fields.length - 1].value)
			});
		} else {
			msg.edit(`${msg.content} \n\nDa fehlt etwas.`);
		}
	} else if (params[0] === 'remove') {
		if (fields[parseInt(params[1]) - 1]) {
			const removed = fields.splice(parseInt(params[1]) - 1, 1)[0].name;
			const embed = new client.methods.Embed();
			embed.setColor('RANDOM').setTitle('To-do-list').setDescription('\u200b')
				.setFooter('\u200b');
			for (const field of fields) embed.addField(field.name, field.value);
			todoMsg.edit({ embed });
			msg.edit(`Eintrag \`${removed}\` entfernt.`);
		} else {
			msg.edit(`Dieser Eintrag wurde nicht gefunden.`);
		}
	} else if (params[0] === 'list') {
		const embed = (new client.methods.Embed()).setColor('RANDOM');
		for (const i in fields) embed.addField(`\`${parseInt(i) + 1}\`: ${fields[i].name}`, fields[i].value);
		msg.edit('To-do-list', { embed });
	} else {
		msg.edit(`${fields.length} Sache${fields.length === 1 ? '' : 'n'} zu erledigen.`);
	}
};


exports.conf = {
	enabled: true,
	aliases: ['doshit']
};


exports.help = {
	name: 'todo',
	shortdescription: '-',
	description: '-',
	usage: '-'
};
