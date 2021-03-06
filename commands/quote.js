exports.run = async (client, msg, params = []) => {
	try {
		let response = '';
		const color = getColor(client, params);
		let channel = msg.channel;

		if (params[0].startsWith('-c')) {
			channel = client.channels.get(params.slice(1).shift());
			params = params.slice(2);
		}

		if (params[0].search(/\D/g) !== -1) {
			response = params[0].substr(params[0].search(/\D/g) + 1);
			params[0] = params[0].substr(0, params[0].search(/\D/g));
		}

		const fetched = (await channel.fetchMessages({ around: params[0], limit: 1 }))
			.filter(message => params[0] === message.id).first();
		if (!fetched) throw String('Nachricht wurde nicht gefunden.');
		fetched.member = channel.guild && await channel.guild.fetchMember(fetched.author);

		const embed = new client.methods.Embed();

		maybeSetTitle(embed, msg, fetched)
			.setAuthor(`${fetched.member
				? fetched.member.displayName
				: fetched.author.username} ${getTime(client, fetched.createdAt)}`,
			fetched.author.displayAvatarURL, client.conf.github)
			.setColor(color || fetched.member ? fetched.member.displayColor : 0)
			.setDescription(fetched.content);

		if (params[1]) {
			params = params.slice(1);

			let breakvar = false;
			while (params.length) {
				let id = params[0];
				if (id.search(/\D/g) === 0) {
					response = params.join(' ');
					break;
				} else if (id.search(/\D/g) !== -1) {
					response = id.substr(id.search(/\D/g));
					id = id.substr(0, id.search(/\D/g));
					breakvar = true;
				}

				const add = (await channel.fetchMessages({ around: id, limit: 1 }))
					.filter(message => id === message.id).first();
				if (!add) continue;
				add.member = channel.guild && await channel.guild.fetchMember(add.author);
				embed.addField(`${add.member
					? add.member.displayName
					: add.author.username} ${getTime(client, add.createdAt)}`, add.content);

				if (breakvar) break;
				params.shift();
			}
		}

		if (!embed.fields.length) {
			if (fetched.embeds[0] && fetched.embeds[0].thumbnail && fetched.embeds[0].thumbnail.url) {
				embed.setDescription(embed.description.replace(fetched.embeds[0].thumbnail.url, ''));
				embed.setImage(fetched.embeds[0].thumbnail.url);
			} else if (fetched.attachments.first() && fetched.attachments.first().width) {
				embed.setImage(fetched.attachments.first().url);
			}
		}
		await msg.edit(response, { embed: embed });
	} catch (error) {
		msg.edit(`${msg.content}

\`E-ROHR\`
\`\`\`js
${error}${error.response && error.response.res && error.response.res.text ? `\n${error.response.res.text}` : ''}
\`\`\``);
	}
};

const maybeSetTitle = (embed, msg, fetched) => {
	if (!fetched.guild) {
		if (msg.channel.id === fetched.channel.id) return embed;
		return embed.setTitle('#DM');
	}
	if (msg.guild.id === fetched.guild.id) {
		if (msg.channel.id !== fetched.channel.id) {
			return embed.setTitle(`#${fetched.channel.name}`);
		} else { return embed; }
	} else { return embed.setTitle(`${fetched.guild.name} #${fetched.channel.name}`); }
};

const getColor = (client, params) => {
	if (params[0].startsWith('0x')) return params.shift();
	if (client.methods.Constants.Colors[params[0].toUpperCase()]) {
		return client.methods.Constants.Colors[params.shift().toUpperCase()];
	}
	if (params[0].toLowerCase() === 'random') {
		params.shift();
		return Math.floor(Math.random() * (0xFFFFFF + 1));
	}
	return 0;
};

const getTime = (client, time) => {
	if (client.methods.moment(time).isSame(new Date(), 'day')) {
		time = client.methods.moment.duration(time - client.methods.moment(time).startOf('day')).format('hh:mm');
	} else {
		time = client.methods.moment(time).format('DD.MM.YYYY - hh:mm');
	}
	if (time.length === 2) time = `00:${time}`;
	return `(${time} CET)`;
};

exports.conf = {
	enabled: true,
	aliases: []
};


exports.help = {
	name: 'quote',
	shortdescription: '-',
	description: '-',
	usage: '-'
};
