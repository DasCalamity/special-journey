exports.run = async (client, msg, params = []) => {
	const time = new Date().getTime();
	try {
		let evaled;
		if (msg.cmd === 'async') evaled = eval(`(async()=>{${params.join(' ')}})();`);
		else evaled = eval(params.join(' '));
		if (evaled instanceof Promise) {
			if (msg.cmd === 'eval') await evaled;
			else evaled = await evaled;
		}
		if (msg.cmd === 'sile') return;
		const responseTypeof = typeof evaled;
		if (typeof evaled !== 'string') {
			evaled = client.inspect(evaled, false, 0);
		}
		if (evaled.includes(client.token)) {
			msg.edit('Was willst du damit anstellen? 👀.');
			return;
		}
		await msg.edit(`${msg.content}

\`evaled\\returned:\` \`typeof: ${responseTypeof}\`
\`\`\`js
${evaled}
\`\`\`
Ausführungszeitraumslänge: \`${new Date().getTime() - time}\`ms`);
	} catch (error) {
		msg.edit(`${msg.content}

\`E-ROHR\`
\`\`\`js
${error}${error.response && error.response.res && error.response.res.text ? `\n${error.response.res.text}` : ''}
\`\`\`
Versuchungszeitraumslänge: \`${new Date().getTime() - time}\`ms`)
			.catch(err => client.discard(err));
	}
};


exports.conf = {
	enabled: true,
	aliases: ['await', 'async', 'sile']
};


exports.help = {
	name: 'eval',
	shortdescription: '-',
	description: '-',
	usage: '-'
};
