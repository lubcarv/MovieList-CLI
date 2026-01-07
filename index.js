const inquirer = require('inquirer');
const fs = require('fs');
const chalk = require('chalk');

async function main() {
    let running = true;
    
    while(running) {
        try {
            console.log('\n');
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
                    running = false;
                    process.exit(0);
            }
        } catch (error) {
            console.error(chalk.red('An error occurred:'), error);
        }
    }
}

async function addMovie() {
  const movies = await loadMovies(); 
  const existingGenres = movies.map(movie => movie.genre);
  
  const uniqueGenres = [...new Set(existingGenres)];
  
  const genreChoices = [...uniqueGenres, ' Add new genre'];

  const answers = await inquirer.prompt([
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
    {      
      type: 'input',
      name: 'description',
      message: 'Enter the movie description:'
    },
    {
      type: 'list',
      name: 'genre',
      message: 'Enter the movie genre:',
      choices: genreChoices
    }
  ]);

  let finalGenre = answers.genre;
  
  if (answers.genre === ' Add new genre') {
      const newGenreAnswer = await inquirer.prompt([
          { type: 'input', name: 'newGenre', message: 'Enter the new genre name:' }
      ]);
      finalGenre = newGenreAnswer.newGenre;
  }

  movies.push({ 
      title: answers.title, 
      genre: finalGenre, 
      year: answers.year, 
      description: answers.description 
  });

  await saveMovies(movies);
  console.log(chalk.green('Movie added successfully!'));
}

async function deleteMovie() {  
  const movies = await loadMovies();
  if (movies.length === 0) {
    console.log(chalk.yellow('No movies to delete.'));
    return; 
  }
  
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'title',
      message: 'Select a movie to delete:',
      choices: movies.map(movie => movie.title)
    }
  ]);

  const updatedMovies = movies.filter(movie => movie.title !== answer.title);
  await saveMovies(updatedMovies);
  console.log(chalk.green('Movie deleted successfully!'));
}

async function viewMovies() {
  const movies = await loadMovies();
  if (movies.length === 0) {
    console.log(chalk.yellow('No movies found.'));
  }
  else {
    console.log(chalk.blue('Movies List:'));
    movies.forEach((movie, index) => {
      console.log(`${index + 1}. ${movie.title} - Genre: ${movie.genre} - Year: ${movie.year}`);
    });
  }
  // Pausa para leitura
  await inquirer.prompt([{type: 'input', name: 'wait', message: 'Press enter to return'}]);
} 

async function viewMoviesByGenre() {
  const movies = await loadMovies();
  if (movies.length === 0) {
    console.log(chalk.yellow('No movies found.'));
    return;
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
  await inquirer.prompt([{type: 'input', name: 'wait', message: 'Press enter to return'}]);
}

async function loadMovies() {
  try {
    const dataBuffer = await fs.promises.readFile('movies.json');    
    const dataJSON = dataBuffer.toString();    
    return JSON.parse(dataJSON);  
  } catch (e) {
    return [];
  }
}

async function saveMovies(movies) {
  const dataJSON = JSON.stringify(movies, null, 2); 
  await fs.promises.writeFile('movies.json', dataJSON);
}


main();