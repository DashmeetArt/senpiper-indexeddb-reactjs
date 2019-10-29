import React from 'react';
import StarIcon from '@material-ui/icons/Star';

function highlight(term, string) {
	const reg = new RegExp(`(${term})`, 'gi');
	return string.split(reg).map((token, index) => (
		<React.Fragment key={`${index}`}>
			{
				(token.toLowerCase() === term.toLowerCase()) ?
					(<span style={{color: 'red'}}>{token}</span>)
					:
					token
			}
		</React.Fragment>
	))
}
function RestaurantCard(props) {
	return (
	    <li
		    className="item"
		    key={`restaurant-${props.id}-${props.name}`}
	    >
			<h5 className='name'>
				{
					props.group === 'name' ?
					highlight(props.term, props.name) :
					props.name
				}
			</h5>
			<p className='address'>
				{
					props.group === 'meta' ?
					highlight(
						props.term,
						`${props.address.street}, ${props.address.city}`
					) :
					`${props.address.street}, ${props.address.city}`
				}
			</p>
			<div className='rating'>
				<StarIcon
					className='icon'
					style={{
						color: props.rating.color || 'transparent'
					}}
				/>
				<span className='text'>{props.rating.text}</span>
			</div>

			<ul className='cuisineContainer'>
				{
					props.cuisines.split(',').map((item, index) => {
						const cuisineName = item.trim();
						return (
							<li key={`cuisines-${index}-${cuisineName}`}>
								{
									props.group === 'meta' ?
									highlight(props.term, cuisineName) :
									cuisineName
								}
							</li>
						)
					})
				}
			</ul>
		</li>
	)
}

export default RestaurantCard;