const inquirer = require('inquirer');
const fs = require('fs');
const chalk = require('chalk');


async function main() {
    try {
        const answers = await inquirer.prompt([
          {
          type: 'list',
          name: 'action',
          message: chalk.bgBlueBright('Welcome to the Movie Manager CLI!'),
          choices: ['Type to add a movie', 'Type to delete a movie', 'Type to view all movies', 'Type to view movies by genre', 'Exit']
        }
    ]);
        switch (answers.action) {
            case 'Type to add a movie':
                await addMovie();       
                break;
            case 'Type to delete a movie':
                await deleteMovie();    
                break;
            case 'Type to view all movies':
                await viewMovies();
                break;
            case 'Type to view movies by genre':
                await viewMoviesByGenre();  
                break;
            case 'Exit':
                console.log(chalk.green('Goodbye!'));
                process.exit(0);
        }
    } catch (error) {
        console.error(chalk.red('An error occurred:'), error);
    }
}

function addMovie() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Enter the movie title:'
    },
    {
      type: 'input',
      name: 'year',
      message: 'Enter the movie year:'
    },
    {      type: 'input',
      name: 'description',
      message: 'Enter the movie description:'
    },
    {
      type: 'input',
      name: 'genre',
      message: 'Enter the movie genre:'
    }
  ]).then(answers => {
    const movies = loadMovies();
    movies.push({ title: answers.title, genre: answers.genre, year: answers.year, description: answers.description });
    saveMovies(movies);
    console.log(chalk.green('Movie added successfully!'));
    main();
  });
}


function deleteMovie() {  
  const movies = loadMovies();
  if (movies.length === 0) {
    console.log(chalk.yellow('No movies to delete.'));
    return main();
  }
  inquirer.prompt([
    {
      type: 'list',
      name: 'title',
      message: 'Select a movie to delete:',
      choices: movies.map(movie => movie.title)
    }
  ]).then(answer => {
    const updatedMovies = movies.filter(movie => movie.title !== answer.title);
    saveMovies(updatedMovies);
    console.log(chalk.green('Movie deleted successfully!'));
    main();
  }
  );
}
function viewMovies() {
  const movies = loadMovies();
  if (movies.length === 0) {
    console.log(chalk.yellow('No movies found.'));
  }
  else {
    console.log(chalk.blue('Movies List:'));
    movies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} - Genre: ${movie.genre} - Year: ${movie.year}`);
    });
  }
  main();
}async function viewMoviesByGenre() {
  const movies = loadMovies();
  if (movies.length === 0) {
    console.log(chalk.yellow('No movies found.'));
    return await main();
  }

  const genres = [...new Set(movies.map(movie => movie.genre))];
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'genre',
      message: 'Select a genre to view movies:',
      choices: genres
    }
  ]);
  const filteredMovies = movies.filter(movie => movie.genre === answer.genre);
  if (filteredMovies.length === 0) {
    console.log(chalk.yellow('No movies found in this genre.'));
  }
  else {
    console.log(chalk.blue(`Movies in Genre: ${answer.genre}`));
    filteredMovies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} (${movie.year})`);
      console.log(`   Description: ${movie.description}`);
    });
  }
  await main();
}

function loadMovies() {
  try {
    const dataBuffer = fs.readFileSync('movies.json');    
    const dataJSON = dataBuffer.toString();    
    return JSON.parse(dataJSON);  
  } catch (e) {
    return [];
  }
}

function saveMovies(movies) {
  const dataJSON = JSON.stringify(movies);  
  fs.writeFileSync('movies.json', dataJSON);
}

main();